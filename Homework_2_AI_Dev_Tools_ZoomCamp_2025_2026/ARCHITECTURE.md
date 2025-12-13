# System Architecture

## Overview

The Online Coding Interview Platform uses a client-server architecture with WebSocket for real-time communication.

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│                    (React Application)                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐     ┌──────────────┐     ┌─────────────┐ │
│  │  Home Page   │     │  Interview   │     │   Router    │ │
│  │  Component   │────▶│    Room      │◀────│ (Routes)    │ │
│  └──────────────┘     └──────────────┘     └─────────────┘ │
│                              │                               │
│                              │                               │
│                    ┌─────────▼─────────┐                    │
│                    │  WebSocket Client │                    │
│                    │  (Real-time sync) │                    │
│                    └─────────┬─────────┘                    │
│                              │                               │
│                    ┌─────────▼─────────┐                    │
│                    │  Syntax Highlighter│                    │
│                    │  (Prism.js)       │                    │
│                    └───────────────────┘                    │
│                                                               │
└────────────────────────┬──────────────────────────────────┘
                         │
                         │ WebSocket (ws://)
                         │ HTTP (REST API)
                         │
┌────────────────────────▼──────────────────────────────────┐
│                         BACKEND                            │
│                  (Node.js + Express)                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐     ┌──────────────┐     ┌─────────────┐ │
│  │  REST API    │     │  WebSocket   │     │   Session   │ │
│  │  Endpoints   │     │    Server    │────▶│   Manager   │ │
│  └──────────────┘     └──────────────┘     └─────────────┘ │
│                              │                               │
│                              │                               │
│                    ┌─────────▼─────────┐                    │
│                    │  Session Storage  │                    │
│                    │  (In-memory Map)  │                    │
│                    └───────────────────┘                    │
│                                                               │
└───────────────────────────────────────────────────────────┘
```

## Component Breakdown

### Frontend Components

#### HomePage
- Creates new interview sessions
- Displays shareable links
- Shows feature list

#### InterviewRoom
- Collaborative code editor
- Real-time syntax highlighting
- Code execution panel
- Language selector
- Participant counter
- Connection status indicator

#### WebSocket Client
- Manages connection to backend
- Handles reconnection logic
- Sends/receives real-time updates

### Backend Components

#### REST API
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:id` - Get session info

#### WebSocket Server
- Manages client connections
- Broadcasts updates to all participants
- Handles session state synchronization

#### Session Manager
- Stores active sessions in memory
- Cleans up inactive sessions
- Manages participant lists

## Data Flow

### Session Creation
```
User → Frontend → HTTP POST → Backend → Generate UUID
                                      → Create Session
                                      → Return Session URL
                                      → Frontend → Display Link
```

### Real-time Code Editing
```
User types → Frontend → WebSocket → Backend → Broadcast to all clients
                                             → Other clients update editor
```

### Code Execution
```
User clicks Run → Frontend → eval() → Capture output
                                    → Display in output panel
```

## WebSocket Message Protocol

### Client → Server

#### Join Session
```json
{
  "type": "join",
  "sessionId": "uuid-string"
}
```

#### Code Change
```json
{
  "type": "codeChange",
  "code": "console.log('Hello');"
}
```

#### Language Change
```json
{
  "type": "languageChange",
  "language": "javascript"
}
```

### Server → Client

#### Initialize Session
```json
{
  "type": "init",
  "code": "// current code",
  "language": "javascript",
  "participants": 2
}
```

#### Code Update
```json
{
  "type": "codeUpdate",
  "code": "// updated code"
}
```

#### Participant Update
```json
{
  "type": "participants",
  "count": 3
}
```

## Scalability Considerations

### Current Implementation
- In-memory session storage
- Single server instance
- Limited to ~10,000 concurrent connections per server

### Production Recommendations
1. **Redis** for session storage (multi-server support)
2. **Load balancer** with sticky sessions
3. **Horizontal scaling** with multiple backend instances
4. **Message queue** (RabbitMQ/Kafka) for event distribution
5. **Database** for persistent session history

### Suggested Production Architecture
```
┌─────────┐     ┌─────────┐
│ Client  │     │ Client  │
└────┬────┘     └────┬────┘
     │               │
     └───────┬───────┘
             │
      ┌──────▼──────┐
      │   Nginx LB  │
      └──────┬──────┘
             │
     ┌───────┴───────┐
     │               │
┌────▼────┐    ┌────▼────┐
│ Server 1│    │ Server 2│
└────┬────┘    └────┬────┘
     │               │
     └───────┬───────┘
             │
      ┌──────▼──────┐
      │    Redis    │
      │  (Sessions) │
      └─────────────┘
```

## Security Layers

### Current Implementation
- CORS enabled
- Basic input validation
- Session cleanup

### Production Requirements
1. **Authentication** - User login/JWT tokens
2. **Rate Limiting** - Prevent abuse
3. **Input Sanitization** - Prevent XSS/injection
4. **Code Execution** - Sandboxed containers (Docker)
5. **HTTPS/WSS** - Encrypted connections
6. **Session Expiry** - Automatic timeout
7. **Access Control** - Private sessions with passwords

## Performance Optimization

### Current
- Direct WebSocket broadcasting
- In-memory operations
- Client-side syntax highlighting

### Optimizations
1. **Message Throttling** - Limit update frequency
2. **Differential Updates** - Send only changes
3. **Compression** - WebSocket compression
4. **CDN** - Static asset delivery
5. **Code Splitting** - Lazy load components
6. **Virtual Scrolling** - Large code files

## Monitoring & Logging

Recommended tools:
- **Application Monitoring**: New Relic, DataDog
- **Error Tracking**: Sentry
- **WebSocket Analytics**: Custom metrics
- **Logging**: Winston, Bunyan

Key metrics to track:
- Active sessions
- Concurrent connections
- Message latency
- Error rates
- Session duration
