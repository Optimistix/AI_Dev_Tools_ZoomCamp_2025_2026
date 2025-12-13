# Project Directory Structure

```
coding-interview-platform/
│
├── 📄 Root Configuration Files
│   ├── package.json              # Root npm scripts (dev, install:all, test)
│   ├── docker-compose.yml        # Docker Compose configuration
│   ├── Dockerfile                # Multi-stage Docker build
│   ├── docker-server.js          # Unified server for Docker deployment
│   ├── .dockerignore             # Files to exclude from Docker build
│   ├── .gitignore                # Files to exclude from Git
│   └── setup.sh                  # Quick setup script
│
├── 📚 Documentation
│   ├── README.md                 # Main project documentation
│   ├── ARCHITECTURE.md           # System architecture & design
│   ├── TESTING.md                # Testing guide & documentation
│   ├── DOCKER.md                 # Docker deployment guide
│   └── PYTHON_EXECUTION.md       # Python/Pyodide execution guide
│
├── 🔧 Backend
│   ├── package.json              # Backend dependencies & scripts
│   ├── server.js                 # Main WebSocket & API server
│   ├── server.test.js            # Backend integration tests
│   └── .env.example              # Example environment variables
│
└── 🎨 Frontend
    ├── package.json              # Frontend dependencies & scripts
    │
    ├── public/
    │   └── index.html            # HTML template (includes Pyodide)
    │
    └── src/
        ├── App.jsx               # Main React application
        ├── App.test.js           # Frontend integration tests
        ├── index.js              # React entry point
        ├── index.css             # Global styles
        └── setupTests.js         # Jest test setup
```

## File Count Summary

**Total Files:** 25

### By Category:
- **Documentation:** 5 files
- **Configuration:** 7 files
- **Backend Code:** 3 files
- **Frontend Code:** 6 files
- **Tests:** 2 files
- **Docker:** 3 files

### By Type:
- **JavaScript/JSX:** 8 files
- **Markdown:** 5 files
- **JSON:** 4 files
- **HTML:** 1 file
- **CSS:** 1 file
- **Shell:** 1 file
- **YAML:** 1 file
- **Config:** 4 files

## Key Files Explained

### Root Level

| File | Purpose |
|------|---------|
| `package.json` | Root npm scripts for running both client & server with `concurrently` |
| `docker-compose.yml` | One-command Docker deployment |
| `Dockerfile` | Multi-stage build: frontend + backend in single container |
| `docker-server.js` | Unified server that serves both API and static frontend |
| `setup.sh` | Automated setup script for first-time installation |

### Backend (`/backend`)

| File | Purpose |
|------|---------|
| `server.js` | Express + WebSocket server for real-time collaboration |
| `server.test.js` | Mocha/Chai integration tests (12 tests) |
| `package.json` | Backend dependencies: express, ws, uuid, cors |
| `.env.example` | Environment variable examples |

### Frontend (`/frontend`)

| File | Purpose |
|------|---------|
| `App.jsx` | Main React app with collaborative editor & Pyodide |
| `App.test.js` | React Testing Library tests (16 tests) |
| `index.js` | React entry point |
| `index.css` | Global styles & scrollbar customization |
| `index.html` | HTML template with Pyodide CDN script |
| `setupTests.js` | Jest configuration for React Testing Library |

### Documentation (`/docs`)

| File | Purpose |
|------|---------|
| `README.md` | Getting started, installation, features, API reference |
| `ARCHITECTURE.md` | System design, data flow, WebSocket protocol |
| `TESTING.md` | Testing strategy, running tests, writing new tests |
| `DOCKER.md` | Docker deployment, cloud platforms, Kubernetes |
| `PYTHON_EXECUTION.md` | Pyodide usage, examples, troubleshooting |

## Dependencies

### Backend Dependencies
```json
{
  "express": "^4.18.2",      // Web server
  "ws": "^8.14.2",            // WebSocket server
  "uuid": "^9.0.1",           // Session ID generation
  "cors": "^2.8.5"            // Cross-origin support
}
```

### Frontend Dependencies
```json
{
  "react": "^18.2.0",                    // UI framework
  "react-dom": "^18.2.0",                // React DOM rendering
  "react-router-dom": "^6.18.0",         // Client-side routing
  "react-syntax-highlighter": "^15.5.0"  // Code highlighting (Prism.js)
}
```

### Dev Dependencies
```json
{
  // Backend Testing
  "mocha": "^10.2.0",                    // Test framework
  "chai": "^4.3.10",                     // Assertions
  "node-fetch": "^2.7.0",                // HTTP testing
  
  // Frontend Testing
  "@testing-library/react": "^13.4.0",   // React testing
  "@testing-library/jest-dom": "^5.16.5",// DOM matchers
  
  // Build & Dev
  "react-scripts": "^5.0.1",             // CRA build tools
  "concurrently": "^8.2.2",              // Run multiple commands
  "nodemon": "^3.0.1"                    // Auto-restart server
}
```

## Build Artifacts (Not in Git)

These directories are created during build but excluded from version control:

```
node_modules/           # All npm dependencies
backend/node_modules/   # Backend dependencies
frontend/node_modules/  # Frontend dependencies
frontend/build/         # Production React build
coverage/               # Test coverage reports
*.log                   # Log files
```

## Environment-Specific Files

### Development
```
backend/server.js       # Uses port 3001
frontend/              # Uses port 3000 (CRA dev server)
```

### Docker/Production
```
docker-server.js       # Single server on port 3001
frontend/build/        # Static files served by docker-server.js
```

## Total Lines of Code (Approximate)

| Category | Files | Lines |
|----------|-------|-------|
| Backend JavaScript | 2 | ~400 |
| Frontend JavaScript | 4 | ~700 |
| Tests | 2 | ~600 |
| Documentation | 5 | ~1,500 |
| Configuration | 7 | ~200 |
| **Total** | **20** | **~3,400** |

## Quick Navigation

**Want to...**
- 🚀 **Get started?** → Read `README.md`
- 🏗️ **Understand architecture?** → Read `ARCHITECTURE.md`
- 🧪 **Run tests?** → Read `TESTING.md`
- 🐳 **Deploy with Docker?** → Read `DOCKER.md`
- 🐍 **Use Python execution?** → Read `PYTHON_EXECUTION.md`
- ⚙️ **Modify backend?** → Edit `backend/server.js`
- 🎨 **Modify frontend?** → Edit `frontend/src/App.jsx`
- 📝 **Add tests?** → Add to `*.test.js` files
