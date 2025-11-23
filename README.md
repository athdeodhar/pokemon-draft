# Pokemon Draft

A web application that allows users to create or join Pokemon draft sessions with support for up to 10 participants.

## Features

- **Create Session**: Start a new drafting session and get a unique session ID
- **Join Session**: Join an existing session using the session ID
- **Real-time Updates**: WebSocket-based real-time user presence
- **Multi-user Support**: Supports up to 10 users per session
- **User Management**: Track participants with usernames and host designation

## Tech Stack

### Backend
- Python 3.x
- Flask (Web framework)
- Flask-CORS (Cross-origin support)
- Flask-SocketIO (WebSocket support)

### Frontend
- React.js
- React Router (Navigation)
- Socket.IO Client (Real-time communication)
- Axios (HTTP requests)

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (optional but recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the backend server:
```bash
python app.py
```

The backend will start on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will start on `http://localhost:3000`

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Enter your username
3. Choose to either:
   - **Create Session**: Click "Create Session" to start a new session
   - **Join Session**: Enter a session ID and click "Join Session"
4. Share the session ID with others to let them join
5. See all participants in real-time on the session page

## API Endpoints

- `GET /api/health` - Health check endpoint
- `POST /api/session/create` - Create a new session
- `POST /api/session/<session_id>/join` - Join an existing session
- `GET /api/session/<session_id>` - Get session details

## WebSocket Events

- `connect` - Client connects to server
- `disconnect` - Client disconnects from server
- `join_room` - User joins a session room
- `leave_room` - User leaves a session room
- `user_joined` - Broadcast when a user joins
- `user_left` - Broadcast when a user leaves

## Project Structure

```
pokemon-draft/
├── backend/
│   ├── app.py              # Flask application
│   ├── requirements.txt    # Python dependencies
│   └── .gitignore
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.js     # Landing page
│   │   │   ├── Home.css
│   │   │   ├── Session.js  # Session page
│   │   │   └── Session.css
│   │   ├── App.js          # Main app component
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   ├── .env                # Environment variables
│   └── .gitignore
└── README.md
```

## Future Enhancements

- Pokemon selection and drafting functionality
- Turn-based draft mechanics
- Draft history and statistics
- Persistent storage (database)
- User authentication
- Session expiration and cleanup