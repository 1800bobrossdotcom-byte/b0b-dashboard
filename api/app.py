"""
B0B API - MILSPEC SECURITY HARDENED
====================================
Security features:
- Rate limiting (per IP and global)
- API key authentication  
- Strict CORS (allowlist only)
- Input sanitization
- Security headers (CSP, HSTS, etc.)
- Request audit logging
- Honeypot endpoints for threat detection
- IP blocking for repeated violations
- Request size limits
- Timing attack prevention
"""

import os
import time
import hashlib
import secrets
import logging
from datetime import datetime, timedelta
from functools import wraps
from collections import defaultdict

from flask import Flask, request, jsonify, g
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
import anthropic
import bleach

load_dotenv()

# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================

class SecurityConfig:
    """Centralized security configuration - NSA would approve 🔒"""
    
    # Allowed origins (strict allowlist)
    ALLOWED_ORIGINS = [
        'https://b0b.dev',
        'https://www.b0b.dev',
        'https://b0b-dashboard-production.up.railway.app',
        os.getenv('DASHBOARD_URL', 'https://b0b.dev'),
    ]
    
    # Add localhost for development
    if os.getenv('FLASK_ENV') == 'development':
        ALLOWED_ORIGINS.extend([
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
        ])
    
    # Rate limits
    RATE_LIMIT_DEFAULT = "100 per hour"
    RATE_LIMIT_CHAT = "10 per minute"  # Claude API is expensive
    RATE_LIMIT_STRICT = "5 per minute"  # For sensitive endpoints
    
    # API Key settings
    API_KEY_HEADER = 'X-B0B-API-Key'
    REQUIRE_API_KEY = os.getenv('REQUIRE_API_KEY', 'false').lower() == 'true'
    
    # Input limits
    MAX_MESSAGE_LENGTH = 10000  # chars
    MAX_REQUEST_SIZE = 1024 * 100  # 100KB
    
    # Threat detection
    BLOCK_THRESHOLD = 10  # Block IP after N violations
    BLOCK_DURATION = 3600  # 1 hour block
    
    # Honeypot paths (attackers love these)
    HONEYPOT_PATHS = [
        '/admin', '/wp-admin', '/phpmyadmin', '/.env',
        '/config', '/backup', '/.git', '/api/admin',
        '/login', '/wp-login.php', '/administrator',
    ]

# =============================================================================
# SECURITY UTILITIES  
# =============================================================================

# In-memory threat tracking (use Redis in production)
blocked_ips = {}
violation_counts = defaultdict(int)
request_log = []

def get_client_ip():
    """Get real client IP, handling proxies"""
    # Check for forwarded header (Railway, Cloudflare, etc.)
    forwarded = request.headers.get('X-Forwarded-For', '')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.remote_addr or '0.0.0.0'

def is_ip_blocked(ip):
    """Check if IP is currently blocked"""
    if ip in blocked_ips:
        if time.time() < blocked_ips[ip]:
            return True
        else:
            del blocked_ips[ip]
            violation_counts[ip] = 0
    return False

def record_violation(ip, reason):
    """Record a security violation and potentially block"""
    violation_counts[ip] += 1
    log_security_event('VIOLATION', ip, reason, violation_counts[ip])
    
    if violation_counts[ip] >= SecurityConfig.BLOCK_THRESHOLD:
        blocked_ips[ip] = time.time() + SecurityConfig.BLOCK_DURATION
        log_security_event('IP_BLOCKED', ip, f'Blocked for {SecurityConfig.BLOCK_DURATION}s', violation_counts[ip])
        return True
    return False

def log_security_event(event_type, ip, details, count=None):
    """Audit log for security events"""
    entry = {
        'timestamp': datetime.utcnow().isoformat(),
        'event': event_type,
        'ip': ip,
        'details': details,
        'violation_count': count,
    }
    request_log.append(entry)
    
    # Keep log bounded
    if len(request_log) > 10000:
        request_log.pop(0)
    
    # Also log to stdout for Railway logs
    logging.warning(f"[SECURITY] {event_type}: {ip} - {details}")

def sanitize_input(text, max_length=None):
    """Sanitize user input - strip dangerous content"""
    if not isinstance(text, str):
        return str(text)
    
    # Strip HTML/scripts
    cleaned = bleach.clean(text, tags=[], strip=True)
    
    # Enforce length limit
    if max_length:
        cleaned = cleaned[:max_length]
    
    return cleaned

def constant_time_compare(a, b):
    """Timing-attack safe string comparison"""
    return secrets.compare_digest(str(a), str(b))

# =============================================================================
# FLASK APP SETUP
# =============================================================================

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = SecurityConfig.MAX_REQUEST_SIZE

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Strict CORS - allowlist only
CORS(app, 
     origins=SecurityConfig.ALLOWED_ORIGINS,
     allow_headers=['Content-Type', 'Authorization', SecurityConfig.API_KEY_HEADER],
     methods=['GET', 'POST', 'OPTIONS'],
     max_age=600)

# Rate limiter
limiter = Limiter(
    app=app,
    key_func=get_client_ip,
    default_limits=[SecurityConfig.RATE_LIMIT_DEFAULT],
    storage_uri="memory://",
)

# =============================================================================
# SECURITY MIDDLEWARE
# =============================================================================

@app.before_request
def security_checkpoint():
    """Security checks before every request"""
    ip = get_client_ip()
    g.request_start = time.time()
    g.client_ip = ip
    
    # Check if IP is blocked
    if is_ip_blocked(ip):
        log_security_event('BLOCKED_REQUEST', ip, request.path)
        return jsonify({'error': 'Access denied', 'code': 'IP_BLOCKED'}), 403
    
    # Honeypot detection
    if request.path.lower() in SecurityConfig.HONEYPOT_PATHS:
        record_violation(ip, f'Honeypot triggered: {request.path}')
        # Return fake "interesting" response to waste attacker time
        return jsonify({
            'error': 'Unauthorized',
            'hint': 'Try /api/v2/admin with valid credentials',
        }), 401
    
    # Log request for audit
    log_security_event('REQUEST', ip, f'{request.method} {request.path}')

@app.after_request
def add_security_headers(response):
    """Add security headers to all responses"""
    # Prevent XSS
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    
    # Strict transport security
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    
    # Content Security Policy
    response.headers['Content-Security-Policy'] = "default-src 'none'; frame-ancestors 'none'"
    
    # Referrer policy
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    
    # Remove server identification
    response.headers['Server'] = 'B0B'
    
    # Cache control for API responses
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, private'
    response.headers['Pragma'] = 'no-cache'
    
    return response

# =============================================================================
# API KEY AUTHENTICATION DECORATOR
# =============================================================================

def require_api_key(f):
    """Decorator to require API key authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not SecurityConfig.REQUIRE_API_KEY:
            return f(*args, **kwargs)
        
        api_key = request.headers.get(SecurityConfig.API_KEY_HEADER)
        valid_key = os.getenv('B0B_API_KEY')
        
        if not api_key:
            record_violation(g.client_ip, 'Missing API key')
            return jsonify({'error': 'API key required', 'code': 'MISSING_KEY'}), 401
        
        if not valid_key or not constant_time_compare(api_key, valid_key):
            record_violation(g.client_ip, 'Invalid API key')
            return jsonify({'error': 'Invalid API key', 'code': 'INVALID_KEY'}), 401
        
        return f(*args, **kwargs)
    return decorated

# =============================================================================
# API ENDPOINTS
# =============================================================================

def get_anthropic_client():
    """Get or create Anthropic client"""
    api_key = os.getenv('CLAUDE_API_KEY')
    if not api_key:
        raise ValueError("CLAUDE_API_KEY environment variable not set")
    return anthropic.Anthropic(api_key=api_key)

@app.route('/', methods=['GET'])
def root():
    """Root endpoint - API info"""
    return jsonify({
        'name': 'B0B API',
        'version': '2.1.0',
        'description': 'An autonomous creative intelligence API',
        'security': 'MILSPEC 🔒',
        'endpoints': {
            '/': 'This info',
            '/api/health': 'Health check',
            '/api/chat': 'Chat with Claude (POST, rate limited)',
            '/api/v1/status': 'Platform status',
        },
        'mantra': "We're Bob Rossing this. 🎨"
    }), 200

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'b0b-api',
        'version': '2.1.0',
        'security': 'active',
        'uptime': time.time(),
    }), 200

@app.route('/api/chat', methods=['POST'])
@limiter.limit(SecurityConfig.RATE_LIMIT_CHAT)
@require_api_key
def chat():
    """Claude chat endpoint - SECURED"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'Message required'}), 400
        
        # Sanitize input
        message = sanitize_input(
            data['message'], 
            max_length=SecurityConfig.MAX_MESSAGE_LENGTH
        )
        
        if len(message) < 1:
            return jsonify({'error': 'Message too short'}), 400
        
        # Validate model selection (prevent injection)
        allowed_models = [
            'claude-3-5-sonnet-20241022',
            'claude-3-opus-20250219', 
            'claude-3-haiku-20250307',
            'claude-sonnet-4-20250514',
            'claude-opus-4-20250514',
        ]
        model = data.get('model', 'claude-3-5-sonnet-20241022')
        if model not in allowed_models:
            record_violation(g.client_ip, f'Invalid model requested: {model}')
            model = 'claude-3-5-sonnet-20241022'
        
        # Get client
        client = get_anthropic_client()
        
        # Call Claude API
        response = client.messages.create(
            model=model,
            max_tokens=1024,
            messages=[
                {
                    'role': 'user',
                    'content': message
                }
            ]
        )
        
        # Extract text response
        text_content = next(
            (block.text for block in response.content if hasattr(block, 'text')),
            None
        )
        
        if not text_content:
            return jsonify({'error': 'No text response from Claude'}), 500
        
        return jsonify({
            'message': text_content,
            'model': model,
            'usage': {
                'input_tokens': response.usage.input_tokens,
                'output_tokens': response.usage.output_tokens
            }
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        return jsonify({'error': 'Internal error'}), 500

@app.route('/api/base/balance', methods=['POST'])
@limiter.limit(SecurityConfig.RATE_LIMIT_STRICT)
@require_api_key
def base_balance():
    """Check BASE blockchain balance - SECURED"""
    try:
        data = request.get_json()
        
        if not data or 'address' not in data:
            return jsonify({'error': 'Address required'}), 400
        
        # Sanitize and validate address format
        address = sanitize_input(data['address'], max_length=50)
        
        # Basic address validation (0x + 40 hex chars)
        if not address.startswith('0x') or len(address) != 42:
            record_violation(g.client_ip, f'Invalid address format: {address[:10]}...')
            return jsonify({'error': 'Invalid address format'}), 400
        
        # Placeholder for BASE blockchain integration
        return jsonify({
            'address': address,
            'balance': '0',
            'network': 'BASE',
            'message': 'BASE integration coming soon'
        }), 200
        
    except Exception as e:
        logger.error(f"Balance error: {str(e)}")
        return jsonify({'error': 'Internal error'}), 500

@app.route('/api/claude/models', methods=['GET'])
def list_models():
    """List available Claude models"""
    models = [
        {
            'id': 'claude-3-5-sonnet-20241022',
            'name': 'Claude 3.5 Sonnet',
            'context': 200000
        },
        {
            'id': 'claude-3-opus-20250219',
            'name': 'Claude 3 Opus',
            'context': 200000
        },
        {
            'id': 'claude-3-haiku-20250307',
            'name': 'Claude 3 Haiku',
            'context': 200000
        },
        {
            'id': 'claude-sonnet-4-20250514',
            'name': 'Claude Sonnet 4',
            'context': 200000
        },
        {
            'id': 'claude-opus-4-20250514',
            'name': 'Claude Opus 4',
            'context': 200000
        }
    ]
    return jsonify({'models': models}), 200

@app.route('/api/v1/status', methods=['GET'])
def platform_status():
    """Platform status - public endpoint"""
    return jsonify({
        'platform': 'B0B',
        'status': 'operational',
        'security_level': 'MILSPEC',
        'active_blocks': len(blocked_ips),
        'timestamp': datetime.utcnow().isoformat(),
    }), 200

# =============================================================================
# SECURITY ADMIN ENDPOINTS (Internal use only)
# =============================================================================

@app.route('/api/internal/security/stats', methods=['GET'])
@limiter.limit("10 per minute")
def security_stats():
    """Security statistics - requires internal key"""
    internal_key = request.headers.get('X-Internal-Key')
    valid_key = os.getenv('INTERNAL_API_KEY')
    
    if not valid_key or not constant_time_compare(internal_key or '', valid_key):
        return jsonify({'error': 'Unauthorized'}), 401
    
    return jsonify({
        'blocked_ips': len(blocked_ips),
        'total_violations': sum(violation_counts.values()),
        'recent_events': request_log[-50:],
        'top_violators': sorted(
            violation_counts.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:10],
    }), 200

# =============================================================================
# ERROR HANDLERS
# =============================================================================

@app.errorhandler(404)
def not_found(error):
    # Could be probing - log it
    log_security_event('404', get_client_ip(), request.path)
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(429)
def rate_limit_exceeded(error):
    record_violation(get_client_ip(), 'Rate limit exceeded')
    return jsonify({
        'error': 'Rate limit exceeded',
        'code': 'RATE_LIMITED',
        'retry_after': error.description
    }), 429

@app.errorhandler(413)
def request_too_large(error):
    record_violation(get_client_ip(), 'Request too large')
    return jsonify({'error': 'Request too large', 'code': 'PAYLOAD_TOO_LARGE'}), 413

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500

# =============================================================================
# STARTUP
# =============================================================================

if __name__ == '__main__':
    logger.info("🔒 B0B API starting with MILSPEC security...")
    logger.info(f"   Allowed origins: {SecurityConfig.ALLOWED_ORIGINS}")
    logger.info(f"   Rate limits: {SecurityConfig.RATE_LIMIT_DEFAULT} (default), {SecurityConfig.RATE_LIMIT_CHAT} (chat)")
    logger.info(f"   API key required: {SecurityConfig.REQUIRE_API_KEY}")
    
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
