# 🔒 B0B Platform Security Documentation

## MILSPEC Security Implementation

This document outlines the enterprise-grade security measures implemented across the B0B platform.

---

## Security Features Overview

### 1. Rate Limiting
| Endpoint Type | Limit | Purpose |
|---------------|-------|---------|
| Default | 100/hour | General protection |
| Chat/AI | 10/min | Protect Claude API credits |
| Tool Execution | 5/min | Prevent abuse |
| Strict | 3/min | High-value endpoints |

### 2. IP-Based Threat Detection
- **Violation Tracking**: Counts suspicious activities per IP
- **Auto-Block**: IPs blocked after 10 violations
- **Block Duration**: 1 hour automatic cooldown
- **Audit Logging**: All security events logged

### 3. Honeypot Endpoints
Fake endpoints that attract attackers and trigger violations:
```
/admin, /wp-admin, /phpmyadmin, /.env, /config, 
/backup, /.git, /api/admin, /login, /shell, /cmd
```

### 4. Input Sanitization
- HTML/script stripping via `bleach`
- Length limits enforced
- Model whitelist validation
- Ethereum address format validation

### 5. Security Headers
All responses include:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'none'
Referrer-Policy: strict-origin-when-cross-origin
Cache-Control: no-store, no-cache, must-revalidate
```

### 6. CORS Protection
Strict allowlist:
- `https://b0b.dev`
- `https://www.b0b.dev`
- `https://api.b0b.dev`
- Railway deployment URLs

### 7. API Key Authentication
- Header: `X-B0B-API-Key` (API) / `X-MCP-API-Key` (MCP)
- Timing-attack safe comparison
- Configurable via `REQUIRE_API_KEY=true`

---

## Environment Variables

### Required
```env
CLAUDE_API_KEY=sk-ant-...
```

### Security (Optional)
```env
REQUIRE_API_KEY=true
B0B_API_KEY=your-secret-key
MCP_API_KEY=your-mcp-key
INTERNAL_API_KEY=your-internal-key
DASHBOARD_URL=https://b0b.dev
FLASK_ENV=production
```

---

## Monitoring & Alerts

### Security Stats Endpoint
```bash
curl -H "X-Internal-Key: $INTERNAL_KEY" \
  https://api.b0b.dev/api/internal/security/stats
```

Response:
```json
{
  "blocked_ips": 3,
  "total_violations": 47,
  "recent_events": [...],
  "top_violators": [
    ["192.168.1.1", 15],
    ["10.0.0.5", 8]
  ]
}
```

### Railway Logs
All security events logged with prefix:
- `[SECURITY]` - API events
- `[MCP-SECURITY]` - MCP events

---

## Attack Mitigation

### Brute Force Protection
- Rate limiting stops mass requests
- Auto-blocking prevents repeated attempts
- Timing-safe comparisons prevent enumeration

### DDoS Mitigation
- Request size limits (100KB max)
- Memory-bounded audit logs
- Railway's built-in DDoS protection

### Injection Prevention
- Input sanitization on all user data
- Model whitelist prevents arbitrary model access
- Address format validation

### Information Disclosure
- Generic error messages
- Server header disguised
- No stack traces in production

---

## Compliance Checklist

- [x] OWASP Top 10 mitigations
- [x] Rate limiting
- [x] Input validation
- [x] Security headers
- [x] Audit logging
- [x] CORS protection
- [x] Authentication layer
- [x] Request size limits
- [x] Error handling

---

## Incident Response

1. **Check blocked IPs**: `/api/internal/security/stats`
2. **Review Railway logs**: Filter by `[SECURITY]`
3. **Adjust thresholds**: Update `SecurityConfig` class
4. **Manual IP block**: Add to `blocked_ips` dict

---

## Future Enhancements

- [ ] Redis-backed rate limiting (distributed)
- [ ] Cloudflare WAF integration
- [ ] Geographic IP blocking
- [ ] JWT token authentication
- [ ] Request signing
- [ ] Anomaly detection ML model

---

*"Security is not a product, but a process."* - Bruce Schneier

**Last Updated**: January 26, 2026
**Security Level**: MILSPEC 🔒
