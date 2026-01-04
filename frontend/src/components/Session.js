import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import './Session.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Session() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const username = localStorage.getItem('username');
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    if (!username || !userId) {
      navigate('/');
      return;
    }

    // Fetch session details
    const fetchSession = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/session/${sessionId}`);
        setSession(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load session');
        setLoading(false);
        console.error(err);
      }
    };

    fetchSession();

    // Setup WebSocket connection
    const newSocket = io(API_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      newSocket.emit('join_room', { session_id: sessionId, username });
    });

    newSocket.on('user_joined', (data) => {
      console.log('User joined:', data);
      fetchSession(); // Refresh session data
    });

    newSocket.on('user_left', (data) => {
      console.log('User left:', data);
      fetchSession(); // Refresh session data
    });

    return () => {
      if (newSocket) {
        newSocket.emit('leave_room', { session_id: sessionId, username });
        newSocket.disconnect();
      }
    };
  }, [sessionId, navigate, username, userId]);

  const copySessionId = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(sessionId)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy session ID:', err);
          // Fallback: select the session ID text
          alert(`Session ID: ${sessionId}`);
        });
    } else {
      // Fallback for browsers that don't support clipboard API
      alert(`Session ID: ${sessionId}`);
    }
  };

  const handleLeaveSession = () => {
    if (socket) {
      socket.emit('leave_room', { session_id: sessionId, username });
      socket.disconnect();
    }
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="session-container">
        <div className="session-card">
          <div className="loading">Loading session...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="session-container">
        <div className="session-card">
          <div className="error-message">{error}</div>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="session-container">
      <div className="session-card">
        <div className="session-header">
          <h1>🎮 Pokemon Draft Session</h1>
          <div className="session-id-container">
            <span className="session-id-label">Session ID:</span>
            <code className="session-id">{sessionId}</code>
            <button onClick={copySessionId} className="copy-btn" title="Copy Session ID">
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
        </div>

        <div className="session-info">
          <div className="info-item">
            <span className="info-label">Your Username:</span>
            <span className="info-value">{username}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Users in Session:</span>
            <span className="info-value">{session?.users?.length || 0} / {session?.max_users || 10}</span>
          </div>
        </div>

        <div className="users-section">
          <h2>Participants ({session?.users?.length || 0})</h2>
          <div className="users-list">
            {session?.users?.map((user, index) => (
              <div key={user.id} className="user-card">
                <div className="user-avatar">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <span className="user-name">
                    {user.username}
                    {user.is_host && <span className="host-badge">HOST</span>}
                    {user.username === username && <span className="you-badge">YOU</span>}
                  </span>
                  <span className="user-position">Player {index + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="draft-area">
          <div className="placeholder-message">
            <h3>🎲 Ready to Draft!</h3>
            <p>Draft functionality coming soon...</p>
            <p className="small-text">This area will be used for Pokemon drafting</p>
          </div>
        </div>

        <div className="session-actions">
          <button onClick={handleLeaveSession} className="btn btn-danger">
            Leave Session
          </button>
        </div>
      </div>
    </div>
  );
}

export default Session;
