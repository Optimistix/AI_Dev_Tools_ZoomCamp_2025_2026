const WebSocket = require('ws');
const http = require('http');
const { expect } = require('chai');
const fetch = require('node-fetch');

// Import the server (we'll need to modify server.js slightly to export it)
// For now, we'll start a test server directly

const EXPRESS_PORT = 3002; // Use different port for testing
const WS_URL = `ws://localhost:${EXPRESS_PORT}`;
const API_URL = `http://localhost:${EXPRESS_PORT}`;

describe('Coding Interview Platform - Integration Tests', function() {
  this.timeout(10000); // Increase timeout for WebSocket tests
  
  let server;
  let testSessionId;

  before(async function() {
    // Start test server
    const express = require('express');
    const httpModule = require('http');
    const wsModule = require('ws');
    const { v4: uuidv4 } = require('uuid');
    const cors = require('cors');

    const app = express();
    server = httpModule.createServer(app);
    const wss = new wsModule.Server({ server });

    app.use(cors());
    app.use(express.json());

    const sessions = new Map();

    app.post('/api/sessions', (req, res) => {
      const sessionId = uuidv4();
      sessions.set(sessionId, {
        id: sessionId,
        code: '// Start coding here...\n',
        language: 'javascript',
        clients: new Set(),
        createdAt: new Date()
      });
      res.json({ sessionId, url: `http://localhost:3000/interview/${sessionId}` });
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

    wss.on('connection', (ws) => {
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

              ws.send(JSON.stringify({
                type: 'init',
                code: session.code,
                language: session.language,
                participants: session.clients.size
              }));

              broadcastToSession(currentSessionId, {
                type: 'participants',
                count: session.clients.size
              });
              break;

            case 'codeChange':
              if (currentSessionId) {
                const session = sessions.get(currentSessionId);
                if (session) {
                  session.code = data.code;
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
                  broadcastToSession(currentSessionId, {
                    type: 'languageUpdate',
                    language: data.language
                  }, ws);
                }
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
            broadcastToSession(currentSessionId, {
              type: 'participants',
              count: session.clients.size
            });
          }
        }
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
    });

    await new Promise((resolve) => {
      server.listen(EXPRESS_PORT, () => {
        console.log(`Test server running on port ${EXPRESS_PORT}`);
        resolve();
      });
    });
  });

  after(function(done) {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  describe('REST API Tests', function() {
    
    it('should create a new session', async function() {
      const response = await fetch(`${API_URL}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      expect(response.status).to.equal(200);
      
      const data = await response.json();
      expect(data).to.have.property('sessionId');
      expect(data).to.have.property('url');
      expect(data.sessionId).to.be.a('string');
      expect(data.sessionId).to.have.length.greaterThan(0);
      
      testSessionId = data.sessionId;
    });

    it('should retrieve session details', async function() {
      const response = await fetch(`${API_URL}/api/sessions/${testSessionId}`);
      
      expect(response.status).to.equal(200);
      
      const data = await response.json();
      expect(data).to.have.property('id', testSessionId);
      expect(data).to.have.property('code');
      expect(data).to.have.property('language');
      expect(data).to.have.property('participants');
      expect(data.language).to.equal('javascript');
    });

    it('should return 404 for non-existent session', async function() {
      const response = await fetch(`${API_URL}/api/sessions/non-existent-id`);
      expect(response.status).to.equal(404);
      
      const data = await response.json();
      expect(data).to.have.property('error');
    });
  });

  describe('WebSocket Tests', function() {
    
    it('should connect to WebSocket server', function(done) {
      const ws = new WebSocket(WS_URL);
      
      ws.on('open', () => {
        expect(ws.readyState).to.equal(WebSocket.OPEN);
        ws.close();
        done();
      });

      ws.on('error', (error) => {
        done(error);
      });
    });

    it('should join a session and receive init message', function(done) {
      const ws = new WebSocket(WS_URL);
      
      ws.on('open', () => {
        ws.send(JSON.stringify({
          type: 'join',
          sessionId: testSessionId
        }));
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data);
        
        if (message.type === 'init') {
          expect(message).to.have.property('code');
          expect(message).to.have.property('language');
          expect(message).to.have.property('participants');
          expect(message.participants).to.be.at.least(1);
          ws.close();
          done();
        }
      });

      ws.on('error', (error) => {
        done(error);
      });
    });

    it('should broadcast code changes to other clients', function(done) {
      const ws1 = new WebSocket(WS_URL);
      const ws2 = new WebSocket(WS_URL);
      
      let ws1Joined = false;
      let ws2Joined = false;
      const testCode = 'console.log("test");';

      ws1.on('open', () => {
        ws1.send(JSON.stringify({
          type: 'join',
          sessionId: testSessionId
        }));
      });

      ws1.on('message', (data) => {
        const message = JSON.parse(data);
        if (message.type === 'init') {
          ws1Joined = true;
          if (ws2Joined) {
            // Both clients joined, send code change
            ws1.send(JSON.stringify({
              type: 'codeChange',
              code: testCode
            }));
          }
        }
      });

      ws2.on('open', () => {
        ws2.send(JSON.stringify({
          type: 'join',
          sessionId: testSessionId
        }));
      });

      ws2.on('message', (data) => {
        const message = JSON.parse(data);
        
        if (message.type === 'init') {
          ws2Joined = true;
          if (ws1Joined) {
            // Both clients joined, send code change from ws1
            ws1.send(JSON.stringify({
              type: 'codeChange',
              code: testCode
            }));
          }
        } else if (message.type === 'codeUpdate') {
          // ws2 received the code update from ws1
          expect(message.code).to.equal(testCode);
          ws1.close();
          ws2.close();
          done();
        }
      });

      ws1.on('error', done);
      ws2.on('error', done);
    });

    it('should broadcast language changes to other clients', function(done) {
      const ws1 = new WebSocket(WS_URL);
      const ws2 = new WebSocket(WS_URL);
      
      let ws1Joined = false;
      let ws2Joined = false;
      const testLanguage = 'python';

      ws1.on('open', () => {
        ws1.send(JSON.stringify({
          type: 'join',
          sessionId: testSessionId
        }));
      });

      ws1.on('message', (data) => {
        const message = JSON.parse(data);
        if (message.type === 'init') {
          ws1Joined = true;
          if (ws2Joined) {
            ws1.send(JSON.stringify({
              type: 'languageChange',
              language: testLanguage
            }));
          }
        }
      });

      ws2.on('open', () => {
        ws2.send(JSON.stringify({
          type: 'join',
          sessionId: testSessionId
        }));
      });

      ws2.on('message', (data) => {
        const message = JSON.parse(data);
        
        if (message.type === 'init') {
          ws2Joined = true;
          if (ws1Joined) {
            ws1.send(JSON.stringify({
              type: 'languageChange',
              language: testLanguage
            }));
          }
        } else if (message.type === 'languageUpdate') {
          expect(message.language).to.equal(testLanguage);
          ws1.close();
          ws2.close();
          done();
        }
      });

      ws1.on('error', done);
      ws2.on('error', done);
    });

    it('should update participant count when clients join/leave', function(done) {
      const ws1 = new WebSocket(WS_URL);
      const ws2 = new WebSocket(WS_URL);
      
      let participantUpdates = [];

      ws1.on('open', () => {
        ws1.send(JSON.stringify({
          type: 'join',
          sessionId: testSessionId
        }));
      });

      ws1.on('message', (data) => {
        const message = JSON.parse(data);
        
        if (message.type === 'participants') {
          participantUpdates.push(message.count);
          
          // After seeing participant count increase
          if (participantUpdates.length === 1) {
            // Close ws2 to test count decrease
            setTimeout(() => ws2.close(), 100);
          } else if (participantUpdates.length === 2) {
            // Verify count decreased
            expect(participantUpdates[1]).to.be.lessThan(participantUpdates[0]);
            ws1.close();
            done();
          }
        }
      });

      ws2.on('open', () => {
        ws2.send(JSON.stringify({
          type: 'join',
          sessionId: testSessionId
        }));
      });

      ws1.on('error', done);
      ws2.on('error', done);
    });

    it('should handle invalid session ID', function(done) {
      const ws = new WebSocket(WS_URL);
      
      ws.on('open', () => {
        ws.send(JSON.stringify({
          type: 'join',
          sessionId: 'invalid-session-id'
        }));
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data);
        
        if (message.type === 'error') {
          expect(message.message).to.equal('Session not found');
          ws.close();
          done();
        }
      });

      ws.on('error', (error) => {
        done(error);
      });
    });

    it('should handle multiple rapid code changes', function(done) {
      const ws1 = new WebSocket(WS_URL);
      const ws2 = new WebSocket(WS_URL);
      
      let ws1Joined = false;
      let ws2Joined = false;
      let receivedUpdates = 0;
      const codeUpdates = [
        'const x = 1;',
        'const x = 2;',
        'const x = 3;'
      ];

      ws1.on('open', () => {
        ws1.send(JSON.stringify({
          type: 'join',
          sessionId: testSessionId
        }));
      });

      ws1.on('message', (data) => {
        const message = JSON.parse(data);
        if (message.type === 'init') {
          ws1Joined = true;
          if (ws2Joined) {
            // Send multiple code updates rapidly
            codeUpdates.forEach((code, index) => {
              setTimeout(() => {
                ws1.send(JSON.stringify({
                  type: 'codeChange',
                  code: code
                }));
              }, index * 10);
            });
          }
        }
      });

      ws2.on('open', () => {
        ws2.send(JSON.stringify({
          type: 'join',
          sessionId: testSessionId
        }));
      });

      ws2.on('message', (data) => {
        const message = JSON.parse(data);
        
        if (message.type === 'init') {
          ws2Joined = true;
          if (ws1Joined) {
            codeUpdates.forEach((code, index) => {
              setTimeout(() => {
                ws1.send(JSON.stringify({
                  type: 'codeChange',
                  code: code
                }));
              }, index * 10);
            });
          }
        } else if (message.type === 'codeUpdate') {
          receivedUpdates++;
          expect(codeUpdates).to.include(message.code);
          
          if (receivedUpdates === codeUpdates.length) {
            ws1.close();
            ws2.close();
            done();
          }
        }
      });

      ws1.on('error', done);
      ws2.on('error', done);
    });
  });

  describe('Session Management Tests', function() {
    
    it('should maintain session state across multiple connections', async function() {
      // Create a new session
      const response = await fetch(`${API_URL}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const { sessionId } = await response.json();

      // Connect first client and change code
      const ws1 = new WebSocket(WS_URL);
      const testCode = 'const sessionTest = true;';

      await new Promise((resolve) => {
        ws1.on('open', () => {
          ws1.send(JSON.stringify({ type: 'join', sessionId }));
        });

        ws1.on('message', (data) => {
          const message = JSON.parse(data);
          if (message.type === 'init') {
            ws1.send(JSON.stringify({
              type: 'codeChange',
              code: testCode
            }));
            setTimeout(() => {
              ws1.close();
              resolve();
            }, 100);
          }
        });
      });

      // Connect second client and verify it receives the updated code
      const ws2 = new WebSocket(WS_URL);

      await new Promise((resolve, reject) => {
        ws2.on('open', () => {
          ws2.send(JSON.stringify({ type: 'join', sessionId }));
        });

        ws2.on('message', (data) => {
          const message = JSON.parse(data);
          if (message.type === 'init') {
            expect(message.code).to.equal(testCode);
            ws2.close();
            resolve();
          }
        });

        ws2.on('error', reject);
      });
    });
  });
});
