import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import anthropic

load_dotenv()

app = Flask(__name__)
CORS(app)

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
        'version': '2.0.0',
        'description': 'An autonomous creative intelligence API',
        'endpoints': {
            '/': 'This info',
            '/api/health': 'Health check',
            '/api/chat': 'Chat with Claude (POST)',
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
        'version': '1.0.0'
    }), 200

@app.route('/api/chat', methods=['POST'])
def chat():
    """Claude chat endpoint"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'Message required'}), 400
        
        message = data['message']
        model = data.get('model', 'claude-3-5-sonnet-20241022')
        
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
        return jsonify({'error': str(e)}), 500

@app.route('/api/base/balance', methods=['POST'])
def base_balance():
    """Check BASE blockchain balance"""
    try:
        data = request.get_json()
        
        if not data or 'address' not in data:
            return jsonify({'error': 'Address required'}), 400
        
        address = data['address']
        
        # Placeholder for BASE blockchain integration
        return jsonify({
            'address': address,
            'balance': '0',
            'network': 'BASE',
            'message': 'BASE integration coming soon'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
        }
    ]
    return jsonify({'models': models}), 200

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
