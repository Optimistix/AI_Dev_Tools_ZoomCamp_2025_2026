import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import App from './App';

// Mock WebSocket
class MockWebSocket {
  static OPEN = 1;
  static instances = [];

  constructor(url) {
    this.url = url;
    this.readyState = MockWebSocket.OPEN;
    this.onopen = null;
    this.onmessage = null;
    this.onclose = null;
    this.onerror = null;
    MockWebSocket.instances.push(this);

    // Simulate connection opening
    setTimeout(() => {
      if (this.onopen) this.onopen();
    }, 10);
  }

  send(data) {
    this.lastSentMessage = JSON.parse(data);
  }

  close() {
    this.readyState = 3; // CLOSED
    if (this.onclose) this.onclose();
  }

  // Helper to simulate receiving a message
  simulateMessage(data) {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(data) });
    }
  }

  static getLastInstance() {
    return this.instances[this.instances.length - 1];
  }

  static reset() {
    this.instances = [];
  }
}

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Coding Interview Platform - Frontend Integration Tests', () => {
  let originalWebSocket;

  beforeAll(() => {
    originalWebSocket = global.WebSocket;
    global.WebSocket = MockWebSocket;
  });

  afterAll(() => {
    global.WebSocket = originalWebSocket;
  });

  beforeEach(() => {
    MockWebSocket.reset();
    global.fetch.mockClear();
    
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(() => Promise.resolve()),
      },
    });
    
    // Mock alert
    global.alert = jest.fn();
  });

  describe('Home Page', () => {
    test('renders home page with create session button', () => {
      render(<App />);
      
      expect(screen.getByText(/Online Coding Interview Platform/i)).toBeInTheDocument();
      expect(screen.getByText(/Create New Interview Session/i)).toBeInTheDocument();
      expect(screen.getByText(/Real-time collaborative editing/i)).toBeInTheDocument();
    });

    test('creates a new session when button is clicked', async () => {
      const mockSessionId = 'test-session-123';
      global.fetch.mockResolvedValueOnce({
        json: async () => ({
          sessionId: mockSessionId,
          url: `http://localhost:3000/interview/${mockSessionId}`
        })
      });

      render(<App />);
      
      const createButton = screen.getByText(/Create New Interview Session/i);
      
      await act(async () => {
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/sessions',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          })
        );
      });
    });

    test('displays session URL after creation', async () => {
      const mockSessionId = 'test-session-456';
      const mockUrl = `http://localhost:3000/interview/${mockSessionId}`;
      
      global.fetch.mockResolvedValueOnce({
        json: async () => ({
          sessionId: mockSessionId,
          url: mockUrl
        })
      });

      render(<App />);
      
      const createButton = screen.getByText(/Create New Interview Session/i);
      
      await act(async () => {
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue(mockUrl)).toBeInTheDocument();
      });
    });

    test('copies link to clipboard when copy button clicked', async () => {
      const mockSessionId = 'test-session-789';
      const mockUrl = `http://localhost:3000/interview/${mockSessionId}`;
      
      global.fetch.mockResolvedValueOnce({
        json: async () => ({
          sessionId: mockSessionId,
          url: mockUrl
        })
      });

      render(<App />);
      
      const createButton = screen.getByText(/Create New Interview Session/i);
      
      await act(async () => {
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/Copy Link/i)).toBeInTheDocument();
      });

      const copyButton = screen.getByText(/Copy Link/i);
      
      await act(async () => {
        fireEvent.click(copyButton);
      });

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockUrl);
      expect(global.alert).toHaveBeenCalledWith('Link copied to clipboard!');
    });
  });

  describe('Interview Room - WebSocket Integration', () => {
    test('connects to WebSocket on mount', async () => {
      // Mock the route to include sessionId
      window.history.pushState({}, '', '/interview/test-session-123');
      
      render(<App />);

      await waitFor(() => {
        const ws = MockWebSocket.getLastInstance();
        expect(ws).toBeDefined();
        expect(ws.url).toBe('ws://localhost:3001');
      });
    });

    test('sends join message when connected', async () => {
      window.history.pushState({}, '', '/interview/test-session-123');
      
      render(<App />);

      await waitFor(() => {
        const ws = MockWebSocket.getLastInstance();
        expect(ws.lastSentMessage).toEqual({
          type: 'join',
          sessionId: 'test-session-123'
        });
      });
    });

    test('updates code editor when receiving init message', async () => {
      window.history.pushState({}, '', '/interview/test-session-456');
      
      render(<App />);

      await waitFor(() => {
        const ws = MockWebSocket.getLastInstance();
        expect(ws).toBeDefined();
      });

      const ws = MockWebSocket.getLastInstance();
      
      await act(async () => {
        ws.simulateMessage({
          type: 'init',
          code: 'const hello = "world";',
          language: 'javascript',
          participants: 1
        });
      });

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText(/Start typing your code here/i);
        expect(textarea.value).toBe('const hello = "world";');
      });
    });

    test('sends code change message when user types', async () => {
      window.history.pushState({}, '', '/interview/test-session-789');
      
      render(<App />);

      await waitFor(() => {
        const ws = MockWebSocket.getLastInstance();
        expect(ws).toBeDefined();
      });

      const ws = MockWebSocket.getLastInstance();
      
      // Initialize the session first
      await act(async () => {
        ws.simulateMessage({
          type: 'init',
          code: '',
          language: 'javascript',
          participants: 1
        });
      });

      const textarea = screen.getByPlaceholderText(/Start typing your code here/i);
      const newCode = 'console.log("test");';
      
      await act(async () => {
        fireEvent.change(textarea, { target: { value: newCode } });
      });

      await waitFor(() => {
        expect(ws.lastSentMessage).toEqual({
          type: 'codeChange',
          code: newCode
        });
      });
    });

    test('updates code when receiving codeUpdate message', async () => {
      window.history.pushState({}, '', '/interview/test-session-999');
      
      render(<App />);

      await waitFor(() => {
        const ws = MockWebSocket.getLastInstance();
        expect(ws).toBeDefined();
      });

      const ws = MockWebSocket.getLastInstance();
      
      // Initialize
      await act(async () => {
        ws.simulateMessage({
          type: 'init',
          code: 'const x = 1;',
          language: 'javascript',
          participants: 2
        });
      });

      // Simulate code update from another user
      const updatedCode = 'const x = 2;';
      await act(async () => {
        ws.simulateMessage({
          type: 'codeUpdate',
          code: updatedCode
        });
      });

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText(/Start typing your code here/i);
        expect(textarea.value).toBe(updatedCode);
      });
    });

    test('sends language change message when language is changed', async () => {
      window.history.pushState({}, '', '/interview/lang-test');
      
      render(<App />);

      await waitFor(() => {
        const ws = MockWebSocket.getLastInstance();
        expect(ws).toBeDefined();
      });

      const ws = MockWebSocket.getLastInstance();
      
      // Initialize
      await act(async () => {
        ws.simulateMessage({
          type: 'init',
          code: '',
          language: 'javascript',
          participants: 1
        });
      });

      const languageSelect = screen.getByDisplayValue('javascript');
      
      await act(async () => {
        fireEvent.change(languageSelect, { target: { value: 'python' } });
      });

      await waitFor(() => {
        expect(ws.lastSentMessage).toEqual({
          type: 'languageChange',
          language: 'python'
        });
      });
    });

    test('updates participant count when receiving participants message', async () => {
      window.history.pushState({}, '', '/interview/participant-test');
      
      render(<App />);

      await waitFor(() => {
        const ws = MockWebSocket.getLastInstance();
        expect(ws).toBeDefined();
      });

      const ws = MockWebSocket.getLastInstance();
      
      // Initialize with 1 participant
      await act(async () => {
        ws.simulateMessage({
          type: 'init',
          code: '',
          language: 'javascript',
          participants: 1
        });
      });

      // Update to 3 participants
      await act(async () => {
        ws.simulateMessage({
          type: 'participants',
          count: 3
        });
      });

      await waitFor(() => {
        const participantCount = screen.getByText('3');
        expect(participantCount).toBeInTheDocument();
      });
    });

    test('displays connection status', async () => {
      window.history.pushState({}, '', '/interview/status-test');
      
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Connected/i)).toBeInTheDocument();
      });
    });

    test('shows disconnected status when WebSocket closes', async () => {
      window.history.pushState({}, '', '/interview/disconnect-test');
      
      render(<App />);

      await waitFor(() => {
        const ws = MockWebSocket.getLastInstance();
        expect(ws).toBeDefined();
      });

      const ws = MockWebSocket.getLastInstance();
      
      await act(async () => {
        ws.close();
      });

      await waitFor(() => {
        expect(screen.getByText(/Disconnected/i)).toBeInTheDocument();
      });
    });
  });

  describe('Code Execution', () => {
    test('executes JavaScript code when Run button is clicked', async () => {
      window.history.pushState({}, '', '/interview/exec-test');
      
      // Mock console.log
      const originalLog = console.log;
      const logSpy = jest.fn();
      console.log = logSpy;

      render(<App />);

      await waitFor(() => {
        const ws = MockWebSocket.getLastInstance();
        expect(ws).toBeDefined();
      });

      const ws = MockWebSocket.getLastInstance();
      
      // Initialize with test code
      const testCode = 'console.log("Hello, World!");';
      await act(async () => {
        ws.simulateMessage({
          type: 'init',
          code: testCode,
          language: 'javascript',
          participants: 1
        });
      });

      const runButton = screen.getByText(/Run Code/i);
      
      await act(async () => {
        fireEvent.click(runButton);
      });

      await waitFor(() => {
        const output = screen.getByText(/Hello, World!/i);
        expect(output).toBeInTheDocument();
      });

      console.log = originalLog;
    });

    test('displays error message when code execution fails', async () => {
      window.history.pushState({}, '', '/interview/error-test');
      
      render(<App />);

      await waitFor(() => {
        const ws = MockWebSocket.getLastInstance();
        expect(ws).toBeDefined();
      });

      const ws = MockWebSocket.getLastInstance();
      
      // Initialize with invalid code
      const invalidCode = 'this will cause an error;';
      await act(async () => {
        ws.simulateMessage({
          type: 'init',
          code: invalidCode,
          language: 'javascript',
          participants: 1
        });
      });

      const runButton = screen.getByText(/Run Code/i);
      
      await act(async () => {
        fireEvent.click(runButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/Error:/i)).toBeInTheDocument();
      });
    });
  });

  describe('Share Link', () => {
    test('copies share link when share button is clicked', async () => {
      window.history.pushState({}, '', '/interview/share-test-123');
      
      render(<App />);

      await waitFor(() => {
        const ws = MockWebSocket.getLastInstance();
        expect(ws).toBeDefined();
      });

      const ws = MockWebSocket.getLastInstance();
      
      await act(async () => {
        ws.simulateMessage({
          type: 'init',
          code: '',
          language: 'javascript',
          participants: 1
        });
      });

      const shareButton = screen.getByText(/Share Link/i);
      
      await act(async () => {
        fireEvent.click(shareButton);
      });

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('/interview/share-test-123')
      );
      expect(global.alert).toHaveBeenCalledWith('Interview link copied to clipboard!');
    });
  });
});
