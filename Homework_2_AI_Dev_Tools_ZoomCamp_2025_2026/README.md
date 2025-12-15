# Online Coding Interview Platform

A real-time collaborative coding interview platform with syntax highlighting, multi-language support, and in-browser code execution.

## Features

✅ **Real-time Collaboration** - Multiple users can edit code simultaneously with live updates  
✅ **Syntax Highlighting** - Beautiful code highlighting for 7+ programming languages  
✅ **Code Execution** - Run JavaScript and Python code safely in the browser (via Pyodide WASM)  
✅ **Shareable Links** - Generate unique interview session links  
✅ **Live Participant Counter** - See how many people are in the session  
✅ **Multi-language Support** - JavaScript, Python, Java, C++, TypeScript, Go, Rust  
✅ **Clean UI** - Professional dark theme inspired by VS Code  
✅ **Secure Execution** - Python runs in WebAssembly sandbox (no server-side code execution)  

## Tech Stack

### Backend
- **Node.js** with Express
- **WebSocket (ws)** for real-time communication
- **UUID** for session management
- **CORS** for cross-origin requests

### Frontend
- **React 18** for UI
- **React Router** for navigation
- **React Syntax Highlighter** for code highlighting
- **Prism** syntax themes

## Project Structure

```
coding-interview-platform/
│
├── 📄 Configuration Files
│   ├── package.json              # Root npm scripts (dev, install:all, test)
│   ├── docker-compose.yml        # Docker Compose orchestration
│   ├── Dockerfile                # Multi-stage Docker build
│   ├── docker-server.js          # Production server (serves both API + frontend)
│   ├── render.yaml               # Render.com deployment config
│   ├── .dockerignore             # Docker build exclusions
│   ├── .gitignore                # Git exclusions
│   └── setup.sh                  # Automated setup script
│
├── 📚 Documentation
│   ├── README.md                 # This file - getting started guide
│   ├── ARCHITECTURE.md           # System architecture & design patterns
│   ├── TESTING.md                # Testing guide & best practices
│   ├── DOCKER.md                 # Docker deployment guide
│   ├── DEPLOYMENT.md             # Cloud deployment (Render, Railway, Fly.io)
│   ├── PYTHON_EXECUTION.md       # Pyodide/Python execution guide
│   └── DIRECTORY_STRUCTURE.md    # Detailed file structure explanation
│
├── 🔧 Backend (/backend)
│   ├── server.js                 # Express + WebSocket server
│   ├── server.test.js            # Mocha integration tests (12 tests)
│   ├── package.json              # Backend dependencies
│   └── .env.example              # Environment variables template
│
└── 🎨 Frontend (/frontend)
    ├── package.json              # Frontend dependencies
    │
    ├── public/
    │   └── index.html            # HTML template (includes Pyodide CDN)
    │
    └── src/
        ├── App.jsx               # Main React app with collaborative editor
        ├── App.test.js           # React Testing Library tests (16 tests)
        ├── index.js              # React entry point
        ├── index.css             # Global styles
        └── setupTests.js         # Jest test configuration
```

**Total:** 26 files | ~3,400 lines of code | 28 integration tests

**Key Features:**
- ✅ Real-time WebSocket collaboration
- ✅ JavaScript + Python execution (Pyodide WASM)
- ✅ Syntax highlighting (Prism.js)
- ✅ Docker containerization
- ✅ Comprehensive testing
- ✅ Cloud deployment ready

See [DIRECTORY_STRUCTURE.md](DIRECTORY_STRUCTURE.md) for detailed file explanations.

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

**Important Notes:**
- 📦 The `node_modules/` folders are **NOT** included in the repository
- They will be automatically created when you run `npm install` or `npm run install:all`
- Total size after installation: ~250-500 MB (this is normal!)
- See [DIRECTORY_STRUCTURE.md](DIRECTORY_STRUCTURE.md) for details on dependencies

### Quick Start (Recommended)

1. **Install all dependencies at once:**
```bash
npm run install:all
```

2. **Run both backend and frontend together:**
```bash
npm run dev
```

This will start both the backend server (port 3001) and frontend (port 3000) concurrently!

### Manual Setup

If you prefer to run them separately:

#### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The backend server will run on `http://localhost:3001`

For development with auto-restart:
```bash
npm run dev
```

#### Frontend Setup

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

The frontend will run on `http://localhost:3000` and automatically open in your browser.

### Docker Deployment (Recommended for Production)

The easiest way to deploy is using Docker:

```bash
# Build and run with Docker Compose
docker-compose up -d

# Access at http://localhost:3001
```

Or using Docker directly:

```bash
# Build the image
docker build -t coding-interview-platform .

# Run the container
docker run -d -p 3001:3001 coding-interview-platform
```

See [DOCKER.md](DOCKER.md) for comprehensive Docker deployment documentation.

**Docker Features:**
- ✅ Single container for both frontend and backend
- ✅ ~150MB optimized image size
- ✅ Multi-stage build for efficiency
- ✅ Health checks included
- ✅ Production-ready with node:18-alpine base

### Quick Free Deployment (Render.com)

Deploy to the cloud in 5 minutes:

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git push -u origin main
```

2. **Deploy on Render:**
   - Go to https://render.com
   - New Web Service → Connect GitHub repo
   - Render auto-detects Docker config
   - Click "Create Web Service"

**Live in 5 minutes!** 🚀

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment guides (Render, Railway, Fly.io, etc.)

## Testing

The platform includes comprehensive integration tests for both backend and frontend.

### Running Backend Tests

```bash
cd backend
npm test
```

**Test Coverage:**
- ✅ REST API endpoints (create session, get session)
- ✅ WebSocket connection and messaging
- ✅ Real-time code synchronization between clients
- ✅ Language change broadcasting
- ✅ Participant count updates
- ✅ Session state persistence
- ✅ Error handling for invalid sessions
- ✅ Multiple rapid updates handling

**Watch mode** (re-runs tests on file changes):
```bash
npm run test:watch
```

### Running Frontend Tests

```bash
cd frontend
npm test
```

**Test Coverage:**
- ✅ Home page rendering and session creation
- ✅ WebSocket connection establishment
- ✅ Real-time code editor synchronization
- ✅ Language selection and broadcasting
- ✅ Code execution functionality
- ✅ Participant counter updates
- ✅ Connection status display
- ✅ Share link functionality

**Watch mode:**
```bash
npm run test:watch
```

**Coverage report:**
```bash
npm run test:coverage
```

### Running All Tests

From the project root directory:

```bash
# Backend tests
cd backend && npm test

# Frontend tests  
cd ../frontend && npm test
```

### Test Terminal Commands Summary

| Command | Description |
|---------|-------------|
| `npm test` | Run tests once and exit |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate coverage report (frontend only) |

## NPM Scripts Reference

All commands should be run from the **project root** directory unless otherwise specified.

### Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Run both backend and frontend concurrently |
| `npm run server` | Run backend server only |
| `npm run client` | Run frontend only |
| `npm run install:all` | Install dependencies for root, backend, and frontend |

### Testing Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests (backend + frontend) |
| `npm run test:backend` | Run backend tests only |
| `npm run test:frontend` | Run frontend tests only |

### Backend-Specific Commands
(Run from `backend/` directory)

| Command | Description |
|---------|-------------|
| `npm start` | Start the backend server |
| `npm run dev` | Start with auto-restart (nodemon) |
| `npm test` | Run backend tests |
| `npm run test:watch` | Run tests in watch mode |

### Frontend-Specific Commands
(Run from `frontend/` directory)

| Command | Description |
|---------|-------------|
| `npm start` | Start the frontend dev server |
| `npm run build` | Build for production |
| `npm test` | Run frontend tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |



## Usage

### Creating an Interview Session

1. Open the application at `http://localhost:3000`
2. Click "Create New Interview Session"
3. A unique session link will be generated
4. Share this link with your candidate
5. Both participants will be automatically connected to the same session

### Using the Code Editor

- **Select Language**: Choose from the dropdown (JavaScript, Python, Java, etc.)
- **Write Code**: Type in the editor with real-time syntax highlighting
- **Run Code**: Click "▶ Run Code" to execute (JavaScript only)
- **View Output**: See execution results in the output panel
- **Share Link**: Click "Share Link" to copy the session URL

### Real-time Features

- **Live Editing**: All code changes sync instantly across all participants
- **Language Sync**: Language selection is synchronized
- **Participant Count**: See the number of active participants
- **Connection Status**: Green dot indicates active connection

## How It Works

### WebSocket Communication

The platform uses WebSocket for real-time bidirectional communication:

1. **Connection**: Client connects to WebSocket server
2. **Session Join**: Client sends `join` message with session ID
3. **Code Updates**: Server broadcasts changes to all connected clients
4. **State Sync**: New clients receive current code and language on join

### Message Types

**Client → Server:**
- `join` - Join a session
- `codeChange` - Code was edited
- `languageChange` - Programming language changed

**Server → Client:**
- `init` - Initial session state
- `codeUpdate` - Code changed by another user
- `languageUpdate` - Language changed by another user
- `participants` - Participant count updated

### Code Execution

Currently supports JavaScript execution in the browser using `eval()`:
- Captures `console.log()` output
- Displays return values
- Shows error messages

> **Note**: For production use, implement server-side execution in isolated containers for security.

## Code Execution

### Supported Languages

**JavaScript** - Immediate execution using browser's JavaScript engine
- ✅ All ES6+ features
- ✅ Console output capture
- ✅ Error handling

**Python** - Executed via Pyodide (WebAssembly)
- ✅ Full Python 3.11 support
- ✅ NumPy, Pandas, and 75+ scientific packages available
- ✅ Runs entirely in browser (no server needed)
- ✅ Sandboxed and secure
- ⏱️ ~5 second initial load time (cached after first use)

See [PYTHON_EXECUTION.md](PYTHON_EXECUTION.md) for detailed Python execution documentation.

### Example Python Code

```python
# Basic Python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

for i in range(10):
    print(f"fib({i}) = {fibonacci(i)}")

# With NumPy (if loaded)
import numpy as np
arr = np.array([1, 2, 3, 4, 5])
print(f"Mean: {arr.mean()}")
```

## API Endpoints

### POST `/api/sessions`
Create a new interview session

**Response:**
```json
{
  "sessionId": "uuid-string",
  "url": "http://localhost:3000/interview/uuid-string"
}
```

### GET `/api/sessions/:id`
Get session details

**Response:**
```json
{
  "id": "uuid-string",
  "code": "// current code",
  "language": "javascript",
  "participants": 2
}
```

## Security Considerations

⚠️ **Important for Production:**

### Current Security Status

**JavaScript Execution:**
- ⚠️ Uses `eval()` - safe for client-side demos but not recommended for production
- ✅ Runs in user's browser sandbox
- ✅ Cannot access server or other users

**Python Execution:**
- ✅ **Fully sandboxed** via Pyodide WebAssembly
- ✅ No file system access
- ✅ No network access
- ✅ No system calls
- ✅ **Production-ready** for interview use cases

### Recommendations for Production

1. **JavaScript Execution**: 
   - Consider server-side sandboxed execution (Docker containers, VM2, isolated-vm)
   - Or keep client-side with clear user warnings

2. **Session Management**: 
   - Add authentication (JWT tokens, OAuth)
   - Implement session timeouts
   - Add password protection for private sessions

3. **Rate Limiting**: 
   - Implement rate limiting on WebSocket messages
   - Add API endpoint throttling
   - Prevent abuse of code execution

4. **Input Validation**: 
   - Validate all incoming messages
   - Sanitize user inputs
   - Check code length limits

5. **HTTPS/WSS**: 
   - **Required** for production deployment
   - Use SSL certificates (free with Render, Railway, etc.)
   - Enforce secure connections only

6. **Monitoring**:
   - Log all sessions and activities
   - Monitor for suspicious patterns
   - Set up alerts for errors

**Note:** Python execution via Pyodide is already production-safe due to WebAssembly's security model.

## Customization

### Adding New Languages

Edit the language dropdown in `frontend/src/App.jsx`:

```jsx
<select value={language} onChange={handleLanguageChange}>
  <option value="javascript">JavaScript</option>
  <option value="python">Python</option>
  {/* Add your language here */}
  <option value="ruby">Ruby</option>
</select>
```

### Changing Theme

Modify the syntax highlighting theme by importing a different Prism theme:

```jsx
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
```

### Adjusting Layout

Modify the `styles` object in `App.jsx` to customize colors, sizes, and spacing.

## Troubleshooting

### WebSocket Connection Failed
- Ensure backend is running on port 3001
- Check CORS settings in `server.js`
- Verify firewall isn't blocking WebSocket connections

### Code Not Syncing
- Check browser console for errors
- Verify WebSocket connection status (green dot)
- Refresh the page to reconnect

### Port Already in Use
Change ports in:
- Backend: `server.js` - modify `PORT` variable
- Frontend: Create `.env` file with `PORT=3001`

## Future Enhancements

- [ ] Server-side code execution for all languages
- [ ] Video/audio chat integration
- [ ] Code review and annotation tools
- [ ] Save and replay interview sessions
- [ ] Collaborative whiteboard
- [ ] Code templates and snippets
- [ ] User authentication
- [ ] Interview feedback system

## Quick Reference

### 📖 Documentation Guide

| Document | Purpose |
|----------|---------|
| **README.md** (this file) | Getting started, installation, features |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | System design, WebSocket protocol, data flow |
| **[TESTING.md](TESTING.md)** | Running tests, writing tests, CI/CD |
| **[DOCKER.md](DOCKER.md)** | Docker deployment, Kubernetes, cloud platforms |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Quick deployment (Render, Railway, Fly.io) |
| **[PYTHON_EXECUTION.md](PYTHON_EXECUTION.md)** | Pyodide usage, examples, troubleshooting |
| **[DIRECTORY_STRUCTURE.md](DIRECTORY_STRUCTURE.md)** | Complete file structure and dependencies |

### 🚀 Common Commands

```bash
# Development
npm run dev              # Run both client + server
npm run server           # Run backend only
npm run client           # Run frontend only

# Installation
npm run install:all      # Install all dependencies
cd backend && npm install   # Backend only
cd frontend && npm install  # Frontend only

# Testing
npm test                 # Run all tests
npm run test:backend     # Backend tests only
npm run test:frontend    # Frontend tests only

# Docker
docker-compose up -d     # Start in Docker
docker-compose logs -f   # View logs
docker-compose down      # Stop Docker

# Production Build
cd frontend && npm run build  # Build React for production
```

### 🔗 Important URLs (Development)

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **WebSocket:** ws://localhost:3001
- **Health Check:** http://localhost:3001/health

### 📦 Dependencies Summary

**Backend:**
- express, ws, uuid, cors
- Dev: mocha, chai, node-fetch, nodemon

**Frontend:**
- react, react-dom, react-router-dom, react-syntax-highlighter
- Dev: @testing-library/react, jest-dom

**Root:**
- concurrently (runs client + server together)

### 🎯 Tech Stack at a Glance

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + React Router |
| **Backend** | Node.js + Express |
| **Real-time** | WebSocket (ws library) |
| **Syntax Highlighting** | Prism.js (via react-syntax-highlighter) |
| **Python Execution** | Pyodide (WebAssembly) |
| **JavaScript Execution** | Browser's native engine |
| **Testing** | Mocha + Chai (backend), Jest + RTL (frontend) |
| **Containerization** | Docker (multi-stage build) |
| **Deployment** | Render.com / Railway / Fly.io |

## License

MIT License - Feel free to use this project for your own purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on the project repository.

---

Built with ❤️ for better technical interviews
