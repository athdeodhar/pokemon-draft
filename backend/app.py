from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
import uuid
import secrets
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = secrets.token_hex(16)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Store sessions in memory (in production, use a database)
sessions = {}

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

@app.route('/api/session/create', methods=['POST'])
def create_session():
    """Create a new session"""
    data = request.get_json()
    username = data.get('username', 'Anonymous')
    
    session_id = str(uuid.uuid4())[:8]
    sessions[session_id] = {
        'id': session_id,
        'created_at': datetime.now().isoformat(),
        'users': [{'id': str(uuid.uuid4()), 'username': username, 'is_host': True}],
        'max_users': 10
    }
    
    return jsonify({
        'session_id': session_id,
        'user_id': sessions[session_id]['users'][0]['id'],
        'username': username
    }), 201

@app.route('/api/session/<session_id>/join', methods=['POST'])
def join_session(session_id):
    """Join an existing session"""
    if session_id not in sessions:
        return jsonify({'error': 'Session not found'}), 404
    
    session = sessions[session_id]
    
    if len(session['users']) >= session['max_users']:
        return jsonify({'error': 'Session is full'}), 400
    
    data = request.get_json()
    username = data.get('username', 'Anonymous')
    
    user_id = str(uuid.uuid4())
    user = {'id': user_id, 'username': username, 'is_host': False}
    session['users'].append(user)
    
    return jsonify({
        'session_id': session_id,
        'user_id': user_id,
        'username': username
    }), 200

@app.route('/api/session/<session_id>', methods=['GET'])
def get_session(session_id):
    """Get session details"""
    if session_id not in sessions:
        return jsonify({'error': 'Session not found'}), 404
    
    return jsonify(sessions[session_id]), 200

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('connection_response', {'data': 'Connected'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('join_room')
def handle_join_room(data):
    session_id = data['session_id']
    username = data['username']
    join_room(session_id)
    emit('user_joined', {
        'username': username,
        'users_count': len(sessions.get(session_id, {}).get('users', []))
    }, room=session_id)

@socketio.on('leave_room')
def handle_leave_room(data):
    session_id = data['session_id']
    username = data['username']
    leave_room(session_id)
    emit('user_left', {
        'username': username,
        'users_count': len(sessions.get(session_id, {}).get('users', []))
    }, room=session_id)

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
