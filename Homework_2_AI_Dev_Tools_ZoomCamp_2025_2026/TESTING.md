# Testing Documentation

## Overview

This document provides detailed information about the testing strategy and test suites for the Online Coding Interview Platform.

## Testing Strategy

The platform uses **integration tests** to verify that the client-server interaction works correctly. Integration tests validate the complete flow from user actions through WebSocket communication to server responses.

### Why Integration Tests?

- **Real-world scenarios**: Tests simulate actual user interactions
- **End-to-end validation**: Verifies complete features work together
- **Catches integration bugs**: Issues that unit tests might miss
- **Confidence in deployments**: Ensures critical paths work correctly

## Technology Stack

### Backend Tests
- **Mocha**: Test framework
- **Chai**: Assertion library
- **node-fetch**: HTTP request testing
- **ws**: WebSocket client for testing

### Frontend Tests
- **Jest**: Test framework (via react-scripts)
- **React Testing Library**: Component testing
- **@testing-library/jest-dom**: DOM matchers

## Backend Test Suite

Location: `backend/server.test.js`

### Test Categories

#### 1. REST API Tests
Validates HTTP endpoints for session management.

**Tests:**
- ✅ Create new session
- ✅ Retrieve session details
- ✅ Handle non-existent sessions (404)

**Example:**
```javascript
it('should create a new session', async function() {
  const response = await fetch(`${API_URL}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  expect(response.status).to.equal(200);
  const data = await response.json();
  expect(data).to.have.property('sessionId');
});
```

#### 2. WebSocket Connection Tests
Validates WebSocket connectivity and basic operations.

**Tests:**
- ✅ Connect to WebSocket server
- ✅ Join session and receive init message
- ✅ Handle invalid session IDs

**Example:**
```javascript
it('should connect to WebSocket server', function(done) {
  const ws = new WebSocket(WS_URL);
  
  ws.on('open', () => {
    expect(ws.readyState).to.equal(WebSocket.OPEN);
    ws.close();
    done();
  });
});
```

#### 3. Real-time Synchronization Tests
Validates multi-client code synchronization.

**Tests:**
- ✅ Broadcast code changes to other clients
- ✅ Broadcast language changes
- ✅ Update participant counts
- ✅ Handle multiple rapid updates

**Example:**
```javascript
it('should broadcast code changes to other clients', function(done) {
  const ws1 = new WebSocket(WS_URL);
  const ws2 = new WebSocket(WS_URL);
  
  // ws1 sends code change
  // ws2 receives the update
  // Assertion: ws2 gets the same code
});
```

#### 4. Session Management Tests
Validates session state persistence.

**Tests:**
- ✅ Maintain session state across connections
- ✅ New clients receive current session state

### Running Backend Tests

```bash
cd backend
npm install  # Install dependencies including test libraries
npm test     # Run all tests
```

**Expected Output:**
```
  REST API Tests
    ✓ should create a new session
    ✓ should retrieve session details
    ✓ should return 404 for non-existent session

  WebSocket Tests
    ✓ should connect to WebSocket server
    ✓ should join a session and receive init message
    ✓ should broadcast code changes to other clients
    ✓ should broadcast language changes to other clients
    ✓ should update participant count when clients join/leave
    ✓ should handle invalid session ID
    ✓ should handle multiple rapid code changes

  Session Management Tests
    ✓ should maintain session state across multiple connections

  12 passing (2s)
```

## Frontend Test Suite

Location: `frontend/src/App.test.js`

### Test Categories

#### 1. Home Page Tests
Validates the landing page and session creation flow.

**Tests:**
- ✅ Render home page elements
- ✅ Create new session on button click
- ✅ Display session URL after creation
- ✅ Copy link to clipboard

**Example:**
```javascript
test('creates a new session when button is clicked', async () => {
  global.fetch.mockResolvedValueOnce({
    json: async () => ({ sessionId: 'test-123', url: '...' })
  });
  
  render(<App />);
  fireEvent.click(screen.getByText(/Create New Interview Session/i));
  
  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalled();
  });
});
```

#### 2. WebSocket Integration Tests
Validates real-time communication with the server.

**Tests:**
- ✅ Connect to WebSocket on mount
- ✅ Send join message when connected
- ✅ Update editor on init message
- ✅ Send code changes to server
- ✅ Receive code updates from server
- ✅ Handle language changes
- ✅ Update participant count
- ✅ Display connection status

**Example:**
```javascript
test('updates code editor when receiving init message', async () => {
  render(<App />);
  
  const ws = MockWebSocket.getLastInstance();
  ws.simulateMessage({
    type: 'init',
    code: 'const hello = "world";',
    language: 'javascript',
    participants: 1
  });
  
  await waitFor(() => {
    const textarea = screen.getByPlaceholderText(/Start typing/i);
    expect(textarea.value).toBe('const hello = "world";');
  });
});
```

#### 3. Code Execution Tests
Validates in-browser code execution.

**Tests:**
- ✅ Execute JavaScript code
- ✅ Display execution output
- ✅ Handle execution errors

#### 4. UI Interaction Tests
Validates user interface interactions.

**Tests:**
- ✅ Share link functionality
- ✅ Language selector
- ✅ Run button
- ✅ Clear output button

### Running Frontend Tests

```bash
cd frontend
npm install  # Install dependencies including test libraries
npm test     # Run all tests (watch mode)
```

For single run:
```bash
npm test -- --watchAll=false
```

**Expected Output:**
```
 PASS  src/App.test.js
  Home Page
    ✓ renders home page with create session button (45ms)
    ✓ creates a new session when button is clicked (32ms)
    ✓ displays session URL after creation (28ms)
    ✓ copies link to clipboard when copy button clicked (25ms)
  
  Interview Room - WebSocket Integration
    ✓ connects to WebSocket on mount (22ms)
    ✓ sends join message when connected (18ms)
    ✓ updates code editor when receiving init message (35ms)
    ✓ sends code change message when user types (42ms)
    ✓ updates code when receiving codeUpdate message (31ms)
    ✓ sends language change message when language is changed (28ms)
    ✓ updates participant count when receiving participants message (24ms)
    ✓ displays connection status (15ms)
    ✓ shows disconnected status when WebSocket closes (20ms)
  
  Code Execution
    ✓ executes JavaScript code when Run button is clicked (38ms)
    ✓ displays error message when code execution fails (27ms)
  
  Share Link
    ✓ copies share link when share button is clicked (22ms)

Test Suites: 1 passed, 1 total
Tests:       16 passed, 16 total
```

## Mock Strategy

### Backend Mocking
Backend tests use a real server instance on a test port (3002) to ensure accurate integration testing.

### Frontend Mocking

**WebSocket Mock:**
```javascript
class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = MockWebSocket.OPEN;
    // Simulate async connection
    setTimeout(() => this.onopen?.(), 10);
  }
  
  simulateMessage(data) {
    this.onmessage?.({ data: JSON.stringify(data) });
  }
}
```

**Fetch Mock:**
```javascript
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ sessionId: 'test', url: '...' })
  })
);
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install backend dependencies
        run: cd backend && npm install
      
      - name: Run backend tests
        run: cd backend && npm test
      
      - name: Install frontend dependencies
        run: cd frontend && npm install
      
      - name: Run frontend tests
        run: cd frontend && npm test -- --watchAll=false
```

## Test Coverage

### Current Coverage Goals
- **Backend**: >80% coverage of critical paths
- **Frontend**: >75% coverage of components and interactions

### Viewing Coverage

**Frontend:**
```bash
cd frontend
npm run test:coverage
```

This generates a coverage report in `frontend/coverage/lcov-report/index.html`

## Writing New Tests

### Backend Test Template

```javascript
describe('New Feature Tests', function() {
  it('should do something specific', async function() {
    // Arrange: Set up test data
    const testData = { /* ... */ };
    
    // Act: Perform the action
    const result = await someFunction(testData);
    
    // Assert: Verify the result
    expect(result).to.equal(expectedValue);
  });
});
```

### Frontend Test Template

```javascript
test('should do something in the UI', async () => {
  // Arrange: Render component
  render(<App />);
  
  // Act: Simulate user action
  fireEvent.click(screen.getByText(/Button Text/i));
  
  // Assert: Verify outcome
  await waitFor(() => {
    expect(screen.getByText(/Expected Text/i)).toBeInTheDocument();
  });
});
```

## Troubleshooting Tests

### Common Issues

**1. Port already in use (Backend)**
```
Error: listen EADDRINUSE: address already in use :::3002
```
**Solution**: Kill process using port 3002 or change test port

**2. WebSocket connection timeout (Backend)**
```
Error: Timeout of 10000ms exceeded
```
**Solution**: Increase timeout in test file or check server startup

**3. Mock not working (Frontend)**
```
TypeError: Cannot read property 'simulateMessage' of undefined
```
**Solution**: Ensure MockWebSocket.reset() is called in beforeEach

**4. Async test failures**
```
Error: Test completed without waiting for async operations
```
**Solution**: Use `await waitFor()` or return promises properly

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Clean State**: Reset mocks and state between tests
3. **Descriptive Names**: Test names should clearly describe what they test
4. **Async Handling**: Always properly handle async operations
5. **Real Scenarios**: Test realistic user workflows
6. **Error Cases**: Don't forget to test error handling
7. **Performance**: Keep tests fast (< 5 seconds per test)

## Future Testing Enhancements

- [ ] Add end-to-end tests with Playwright/Cypress
- [ ] Add performance testing for concurrent users
- [ ] Add load testing for WebSocket connections
- [ ] Implement visual regression testing
- [ ] Add API contract testing
- [ ] Increase coverage to 90%+
- [ ] Add mutation testing

## Resources

- [Mocha Documentation](https://mochajs.org/)
- [Chai Assertion Library](https://www.chaijs.com/)
- [React Testing Library](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/)
- [WebSocket Testing Guide](https://github.com/websockets/ws#usage-examples)
