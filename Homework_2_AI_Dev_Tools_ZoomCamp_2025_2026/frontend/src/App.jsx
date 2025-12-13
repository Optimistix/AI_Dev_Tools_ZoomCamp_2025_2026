import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, useParams, useNavigate } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Home page - Create new interview session
function HomePage() {
  const [sessionUrl, setSessionUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const createSession = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NODE_ENV === 'production'
        ? '/api/sessions'
        : 'http://localhost:3001/api/sessions';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setSessionUrl(data.url);
      
      // Auto-navigate to the session
      navigate(`/interview/${data.sessionId}`);
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to create session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.homePage}>
      <div style={styles.homeCard}>
        <h1 style={styles.homeTitle}>Online Coding Interview Platform</h1>
        <p style={styles.homeSubtitle}>
          Create a collaborative coding environment for technical interviews
        </p>
        
        <button 
          onClick={createSession} 
          disabled={loading}
          style={styles.createButton}
        >
          {loading ? 'Creating...' : 'Create New Interview Session'}
        </button>
        
        {sessionUrl && (
          <div style={styles.urlCard}>
            <p style={styles.urlLabel}>Share this link with your candidate:</p>
            <input 
              type="text" 
              value={sessionUrl} 
              readOnly 
              style={styles.urlInput}
              onClick={(e) => e.target.select()}
            />
            <button 
              onClick={() => {
                navigator.clipboard.writeText(sessionUrl);
                alert('Link copied to clipboard!');
              }}
              style={styles.copyButton}
            >
              Copy Link
            </button>
          </div>
        )}
        
        <div style={styles.features}>
          <h3>Features:</h3>
          <ul style={styles.featureList}>
            <li>✅ Real-time collaborative editing</li>
            <li>✅ Syntax highlighting for multiple languages</li>
            <li>✅ In-browser code execution</li>
            <li>✅ Live participant counter</li>
            <li>✅ Shareable interview links</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Interview Room - Collaborative coding editor
function InterviewRoom() {
  const { sessionId } = useParams();
  const [code, setCode] = useState('// Loading...\n');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [participants, setParticipants] = useState(0);
  const [connected, setConnected] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const wsRef = useRef(null);
  const textareaRef = useRef(null);
  const pyodideRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket - use window.location.host in production, localhost:3001 in development
    const wsUrl = process.env.NODE_ENV === 'production' 
      ? `ws://${window.location.host}`
      : 'ws://localhost:3001';
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
      ws.send(JSON.stringify({ type: 'join', sessionId }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'init':
          setCode(data.code);
          setLanguage(data.language);
          setParticipants(data.participants);
          break;
        case 'codeUpdate':
          setCode(data.code);
          break;
        case 'languageUpdate':
          setLanguage(data.language);
          break;
        case 'participants':
          setParticipants(data.count);
          break;
        case 'error':
          console.error('WebSocket error:', data.message);
          break;
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    };

    // Initialize Pyodide for Python execution
    const initPyodide = async () => {
      try {
        setOutput('Loading Python interpreter...');
        const pyodide = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
        });
        pyodideRef.current = pyodide;
        setPyodideReady(true);
        setOutput('Python interpreter ready!');
        console.log('Pyodide initialized successfully');
        
        // Clear the message after 2 seconds
        setTimeout(() => setOutput(''), 2000);
      } catch (error) {
        console.error('Failed to load Pyodide:', error);
        setOutput('Failed to load Python interpreter. JavaScript execution still available.');
      }
    };

    initPyodide();

    return () => {
      ws.close();
    };
  }, [sessionId]);

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'codeChange',
        code: newCode
      }));
    }
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'languageChange',
        language: newLanguage
      }));
    }
  };

  const executeCode = async () => {
    setIsExecuting(true);
    setOutput('Running...\n');
    
    try {
      if (language === 'javascript') {
        // Capture console.log output
        const logs = [];
        const originalLog = console.log;
        console.log = (...args) => {
          logs.push(args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '));
        };
        
        try {
          // Execute the code
          const result = eval(code);
          console.log = originalLog;
          
          const outputText = logs.length > 0 ? logs.join('\n') : String(result);
          setOutput(outputText || 'Code executed successfully (no output)');
        } catch (error) {
          console.log = originalLog;
          setOutput(`Error: ${error.message}`);
        }
      } else if (language === 'python') {
        if (!pyodideReady || !pyodideRef.current) {
          setOutput('Python interpreter is still loading... Please wait a moment and try again.');
          setIsExecuting(false);
          return;
        }

        try {
          const pyodide = pyodideRef.current;
          
          // Redirect stdout to capture print statements
          await pyodide.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = StringIO()
          `);
          
          // Execute the user's code
          await pyodide.runPythonAsync(code);
          
          // Get the output
          const stdout = await pyodide.runPythonAsync('sys.stdout.getvalue()');
          
          setOutput(stdout || 'Code executed successfully (no output)');
        } catch (error) {
          setOutput(`Python Error: ${error.message}`);
        }
      } else {
        setOutput(`Note: ${language} execution is not yet supported. Currently available: JavaScript and Python.`);
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/interview/${sessionId}`;
    navigator.clipboard.writeText(link);
    alert('Interview link copied to clipboard!');
  };

  return (
    <div style={styles.interviewRoom}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h2 style={styles.headerTitle}>Coding Interview</h2>
          <span style={styles.sessionId}>Session: {sessionId.slice(0, 8)}</span>
        </div>
        
        <div style={styles.headerRight}>
          <div style={styles.statusIndicator}>
            <div style={{
              ...styles.statusDot,
              backgroundColor: connected ? '#10b981' : '#ef4444'
            }} />
            <span style={styles.statusText}>
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          <div style={styles.participants}>
            <span style={styles.participantIcon}>👥</span>
            <span style={styles.participantCount}>{participants}</span>
          </div>
          
          <button onClick={copyShareLink} style={styles.shareButton}>
            Share Link
          </button>
        </div>
      </header>

      <div style={styles.toolbar}>
        <select 
          value={language} 
          onChange={handleLanguageChange}
          style={styles.languageSelect}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="typescript">TypeScript</option>
          <option value="go">Go</option>
          <option value="rust">Rust</option>
        </select>

        <button 
          onClick={executeCode} 
          disabled={isExecuting || (language === 'python' && !pyodideReady)}
          style={{
            ...styles.runButton,
            opacity: (isExecuting || (language === 'python' && !pyodideReady)) ? 0.6 : 1,
            cursor: (isExecuting || (language === 'python' && !pyodideReady)) ? 'not-allowed' : 'pointer'
          }}
        >
          {isExecuting ? '⏳ Running...' : '▶ Run Code'}
          {language === 'python' && !pyodideReady && ' (Loading Python...)'}
        </button>
      </div>

      <div style={styles.editorContainer}>
        <div style={styles.editorPanel}>
          <div style={styles.panelHeader}>
            <span>Code Editor</span>
            <span style={styles.languageBadge}>{language}</span>
          </div>
          
          <div style={styles.editorWrapper}>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={handleCodeChange}
              style={styles.codeEditor}
              spellCheck={false}
              placeholder="Start typing your code here..."
            />
            
            <div style={styles.syntaxHighlight} aria-hidden="true">
              <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '16px',
                  background: 'transparent',
                  fontSize: '14px',
                  fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace"
                }}
              >
                {code || ' '}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>

        <div style={styles.outputPanel}>
          <div style={styles.panelHeader}>
            <span>Output</span>
            <button 
              onClick={() => setOutput('')}
              style={styles.clearButton}
            >
              Clear
            </button>
          </div>
          
          <pre style={styles.output}>
            {output || 'Run your code to see output here...'}
          </pre>
        </div>
      </div>
    </div>
  );
}

// Main App component
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/interview/:sessionId" element={<InterviewRoom />} />
      </Routes>
    </Router>
  );
}

// Styles
const styles = {
  homePage: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },
  homeCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '48px',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
  },
  homeTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '12px',
    textAlign: 'center'
  },
  homeSubtitle: {
    fontSize: '16px',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: '32px'
  },
  createButton: {
    width: '100%',
    padding: '16px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    ':hover': {
      transform: 'translateY(-2px)'
    }
  },
  urlCard: {
    marginTop: '24px',
    padding: '20px',
    background: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  urlLabel: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '8px'
  },
  urlInput: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    marginBottom: '12px',
    fontFamily: 'monospace'
  },
  copyButton: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#667eea',
    background: 'white',
    border: '2px solid #667eea',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  features: {
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid #e5e7eb'
  },
  featureList: {
    listStyle: 'none',
    padding: 0,
    margin: '12px 0 0 0',
    color: '#4b5563',
    fontSize: '14px',
    lineHeight: '2'
  },
  interviewRoom: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#1e1e1e',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    background: '#252526',
    borderBottom: '1px solid #3e3e42'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
    margin: 0
  },
  sessionId: {
    fontSize: '12px',
    color: '#8b8b8b',
    fontFamily: 'monospace'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  statusText: {
    fontSize: '13px',
    color: '#cccccc'
  },
  participants: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    background: '#3e3e42',
    borderRadius: '6px'
  },
  participantIcon: {
    fontSize: '16px'
  },
  participantCount: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff'
  },
  shareButton: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    background: '#0078d4',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 24px',
    background: '#2d2d30',
    borderBottom: '1px solid #3e3e42'
  },
  languageSelect: {
    padding: '8px 12px',
    fontSize: '14px',
    background: '#3e3e42',
    color: '#cccccc',
    border: '1px solid #555555',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  runButton: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    background: '#16a34a',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  editorContainer: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden'
  },
  editorPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #3e3e42'
  },
  outputPanel: {
    width: '400px',
    display: 'flex',
    flexDirection: 'column',
    background: '#1e1e1e'
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: '#2d2d30',
    borderBottom: '1px solid #3e3e42',
    fontSize: '13px',
    fontWeight: '600',
    color: '#cccccc'
  },
  languageBadge: {
    padding: '4px 8px',
    fontSize: '11px',
    background: '#3e3e42',
    borderRadius: '4px',
    textTransform: 'uppercase'
  },
  clearButton: {
    padding: '4px 12px',
    fontSize: '12px',
    color: '#cccccc',
    background: '#3e3e42',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  editorWrapper: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden'
  },
  codeEditor: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    padding: '16px',
    fontSize: '14px',
    fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
    lineHeight: '1.5',
    color: 'transparent',
    caretColor: '#ffffff',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    resize: 'none',
    zIndex: 2,
    whiteSpace: 'pre',
    overflowWrap: 'normal',
    overflow: 'auto'
  },
  syntaxHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 1,
    overflow: 'auto'
  },
  output: {
    flex: 1,
    padding: '16px',
    margin: 0,
    fontSize: '13px',
    fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
    lineHeight: '1.6',
    color: '#d4d4d4',
    background: '#1e1e1e',
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  }
};

export default App;
