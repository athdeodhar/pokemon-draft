import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Home() {
  const [username, setUsername] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/session/create`, {
        username: username.trim()
      });

      const { session_id, user_id } = response.data;
      localStorage.setItem('user_id', user_id);
      localStorage.setItem('username', username.trim());
      navigate(`/session/${session_id}`);
    } catch (err) {
      setError('Failed to create session. Please try again.');
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinSession = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    if (!sessionId.trim()) {
      setError('Please enter a session ID');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/session/${sessionId.trim()}/join`, {
        username: username.trim()
      });

      const { user_id } = response.data;
      localStorage.setItem('user_id', user_id);
      localStorage.setItem('username', username.trim());
      navigate(`/session/${sessionId.trim()}`);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('Session not found');
      } else if (err.response && err.response.status === 400) {
        setError('Session is full (max 10 users)');
      } else {
        setError('Failed to join session. Please try again.');
      }
      console.error(err);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="home-container">
      <div className="home-card">
        <h1 className="home-title">🎮 Pokemon Draft</h1>
        <p className="home-subtitle">Create or join a drafting session</p>

        {error && <div className="error-message">{error}</div>}

        <div className="input-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field"
            maxLength={20}
          />
        </div>

        <div className="actions-section">
          <div className="action-group">
            <h3>Create New Session</h3>
            <button
              onClick={handleCreateSession}
              disabled={isCreating || !username.trim()}
              className="btn btn-primary"
            >
              {isCreating ? 'Creating...' : 'Create Session'}
            </button>
          </div>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="action-group">
            <h3>Join Existing Session</h3>
            <input
              type="text"
              placeholder="Enter Session ID"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="input-field"
              maxLength={8}
            />
            <button
              onClick={handleJoinSession}
              disabled={isJoining || !username.trim() || !sessionId.trim()}
              className="btn btn-secondary"
            >
              {isJoining ? 'Joining...' : 'Join Session'}
            </button>
          </div>
        </div>

        <div className="info-section">
          <p>💡 Sessions support up to 10 users</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
