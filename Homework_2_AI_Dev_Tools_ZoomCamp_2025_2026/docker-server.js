const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

// Store active sessions
const sessions = new Map();

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', sessions: sessions.size });
});

// API Routes
app.post('/api/sessions', (req, res) => {
  const sessionId = uuidv4();
  sessions.set(sessionId, {
    id: sessionId,
    code: '// Start coding here...\n',
    language: 'javascript',
    clients: new Set(),
    createdAt: new Date()
  });
  
  const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
  res.json({ sessionId, url: `${baseUrl}/interview/${sessionId}` });
});

app.get('/api/sessions/:id', (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json({
    id: session.id,
    code: session.code,
    language: session.language,
    participants: session.clients.size
  });
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'frontend/build')));

// All other routes serve the React app (for client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  let currentSessionId = null;
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'join':
          currentSessionId = data.sessionId;
          const session = sessions.get(currentSessionId);
          
          if (!session) {
            ws.send(JSON.stringify({ type: 'error', message: 'Session not found' }));
            return;
          }
          
          session.clients.add(ws);
          
          // Send current state to new client
          ws.send(JSON.stringify({
            type: 'init',
            code: session.code,
            language: session.language,
            participants: session.clients.size
          }));
          
          // Notify all clients about participant count
          broadcastToSession(currentSessionId, {
            type: 'participants',
            count: session.clients.size
          });
          
          console.log(`Client joined session ${currentSessionId}. Total participants: ${session.clients.size}`);
          break;
          
        case 'codeChange':
          if (currentSessionId) {
            const session = sessions.get(currentSessionId);
            if (session) {
              session.code = data.code;
              
              // Broadcast to all other clients in the session
              broadcastToSession(currentSessionId, {
                type: 'codeUpdate',
                code: data.code
              }, ws);
            }
          }
          break;
          
        case 'languageChange':
          if (currentSessionId) {
            const session = sessions.get(currentSessionId);
            if (session) {
              session.language = data.language;
              
              // Broadcast to all clients in the session
              broadcastToSession(currentSessionId, {
                type: 'languageUpdate',
                language: data.language
              }, ws);
            }
          }
          break;
          
        case 'cursorPosition':
          // Broadcast cursor position to other clients
          if (currentSessionId) {
            broadcastToSession(currentSessionId, {
              type: 'cursorUpdate',
              userId: data.userId,
              position: data.position
            }, ws);
          }
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
  
  ws.on('close', () => {
    if (currentSessionId) {
      const session = sessions.get(currentSessionId);
      if (session) {
        session.clients.delete(ws);
        
        // Notify remaining clients about participant count
        broadcastToSession(currentSessionId, {
          type: 'participants',
          count: session.clients.size
        });
        
        console.log(`Client left session ${currentSessionId}. Remaining participants: ${session.clients.size}`);
        
        // Clean up empty sessions after 1 hour
        if (session.clients.size === 0) {
          setTimeout(() => {
            const currentSession = sessions.get(currentSessionId);
            if (currentSession && currentSession.clients.size === 0) {
              sessions.delete(currentSessionId);
              console.log(`Cleaned up empty session ${currentSessionId}`);
            }
          }, 3600000); // 1 hour
        }
      }
    }
  });
});

function broadcastToSession(sessionId, message, excludeWs = null) {
  const session = sessions.get(sessionId);
  if (!session) return;
  
  const messageStr = JSON.stringify(message);
  session.clients.forEach(client => {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

// Clean up old sessions (older than 24 hours)
setInterval(() => {
  const now = new Date();
  sessions.forEach((session, id) => {
    const hoursSinceCreation = (now - session.createdAt) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24) {
      session.clients.forEach(client => client.close());
      sessions.delete(id);
      console.log(`Cleaned up old session ${id}`);
    }
  });
}, 3600000); // Run every hour

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`WebSocket: ws://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
