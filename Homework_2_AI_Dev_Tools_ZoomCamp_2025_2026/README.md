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
├── backend/
│   ├── server.js           # WebSocket server & REST API
│   └── package.json
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.jsx         # Main React application
    │   ├── index.js        # React entry point
    │   └── index.css       # Global styles
    └── package.json
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

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

1. **Code Execution**: Current implementation uses `eval()` which is unsafe for production. Implement server-side sandboxed execution.

2. **Session Management**: Add authentication and session timeouts.

3. **Rate Limiting**: Implement rate limiting on WebSocket messages and API endpoints.

4. **Input Validation**: Validate all incoming messages and sanitize code.

5. **HTTPS/WSS**: Use secure connections in production.

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

## License

MIT License - Feel free to use this project for your own purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on the project repository.

---

Built with ❤️ for better technical interviews
