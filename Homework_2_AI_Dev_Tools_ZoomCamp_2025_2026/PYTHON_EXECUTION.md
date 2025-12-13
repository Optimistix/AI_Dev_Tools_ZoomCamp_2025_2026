# Python Execution with Pyodide

## Overview

The platform uses **Pyodide** to execute Python code directly in the browser using WebAssembly. This provides secure, sandboxed Python execution without requiring a backend server.

## What is Pyodide?

**Pyodide** is a port of CPython to WebAssembly/Emscripten. It allows you to run Python code in the browser with:

- ✅ **Full Python 3.11** support
- ✅ **NumPy, Pandas, Matplotlib** and 75+ scientific packages
- ✅ **Complete isolation** - runs in the browser sandbox
- ✅ **No server required** - fully client-side execution
- ✅ **Fast** - compiled to WebAssembly for near-native performance

## How It Works

### 1. Initialization

When the interview room loads, Pyodide is automatically downloaded and initialized:

```javascript
const pyodide = await window.loadPyodide({
  indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
});
```

**Size:** ~6.5MB gzipped (one-time download, cached by browser)

**Load Time:** 3-8 seconds depending on network speed

### 2. Code Execution

When you click "Run Code" with Python selected:

```javascript
// Redirect stdout to capture print statements
await pyodide.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = StringIO()
`);

// Execute user code
await pyodide.runPythonAsync(userCode);

// Get output
const output = await pyodide.runPythonAsync('sys.stdout.getvalue()');
```

### 3. Output Capture

All `print()` statements are captured and displayed in the output panel.

## Supported Features

### ✅ What Works

**Basic Python:**
```python
# Variables and data types
name = "Alice"
age = 30
print(f"Hello, {name}! You are {age} years old.")

# Functions
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))

# Classes
class Person:
    def __init__(self, name):
        self.name = name
    
    def greet(self):
        return f"Hello, I'm {self.name}"

p = Person("Bob")
print(p.greet())
```

**Data Structures:**
```python
# Lists, dicts, sets, tuples
numbers = [1, 2, 3, 4, 5]
print(sum(numbers))

person = {"name": "Alice", "age": 30}
print(person["name"])

unique = {1, 2, 2, 3, 3, 3}
print(len(unique))
```

**List Comprehensions:**
```python
squares = [x**2 for x in range(10)]
print(squares)

evens = [x for x in range(20) if x % 2 == 0]
print(evens)
```

**Lambda Functions:**
```python
add = lambda x, y: x + y
print(add(5, 3))

numbers = [1, 2, 3, 4, 5]
doubled = list(map(lambda x: x * 2, numbers))
print(doubled)
```

**Scientific Computing (if packages loaded):**
```python
import numpy as np

# Create arrays
arr = np.array([1, 2, 3, 4, 5])
print(arr.mean())

# Matrix operations
matrix = np.array([[1, 2], [3, 4]])
print(np.linalg.det(matrix))
```

### ❌ What Doesn't Work

**File System Access:**
```python
# ❌ Won't work - no real file system
with open('file.txt', 'r') as f:
    content = f.read()
```

**Network Requests (native):**
```python
# ❌ Won't work - no native network access
import urllib.request
urllib.request.urlopen('https://example.com')
```

**Threading:**
```python
# ❌ Limited threading support
import threading
```

**System Calls:**
```python
# ❌ No system access
import os
os.system('ls')
```

## Loading Additional Packages

Pyodide comes with many packages pre-installed. To load additional packages:

```python
import micropip
await micropip.install('package-name')
```

**Pre-installed packages include:**
- numpy
- pandas
- matplotlib
- scipy
- scikit-learn
- beautifulsoup4
- regex
- And 70+ more!

Full list: https://pyodide.org/en/stable/usage/packages-in-pyodide.html

## Performance Considerations

### Startup Time
- **First load:** 3-8 seconds (downloads ~6.5MB)
- **Subsequent loads:** Instant (cached)

### Execution Speed
- **Simple code:** Near-native speed
- **NumPy operations:** 70-90% of native speed
- **Pure Python loops:** Slower than native (use NumPy when possible)

### Memory
- **Typical usage:** 30-50MB
- **With NumPy:** 50-100MB
- **Browser limit:** Varies (usually 500MB-2GB)

## Security

### Sandboxed Execution

Pyodide runs in the browser's JavaScript sandbox, which provides:

✅ **No file system access** - Cannot read/write local files
✅ **No network access** - Cannot make direct network requests
✅ **No system calls** - Cannot execute system commands
✅ **Memory isolation** - Cannot access other tabs or browser data
✅ **Same-origin policy** - Limited by browser security

### Safe for Interviews

This makes it **perfect for coding interviews** because:
- Candidates cannot access the interviewer's system
- Code runs entirely in the candidate's browser
- No risk of malicious code affecting servers
- Each session is completely isolated

## Example Interview Questions

### Easy - FizzBuzz
```python
for i in range(1, 101):
    if i % 15 == 0:
        print("FizzBuzz")
    elif i % 3 == 0:
        print("Fizz")
    elif i % 5 == 0:
        print("Buzz")
    else:
        print(i)
```

### Medium - Two Sum
```python
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

print(two_sum([2, 7, 11, 15], 9))  # [0, 1]
```

### Hard - LRU Cache
```python
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.cache = OrderedDict()
        self.capacity = capacity
    
    def get(self, key):
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]
    
    def put(self, key, value):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)

cache = LRUCache(2)
cache.put(1, 1)
cache.put(2, 2)
print(cache.get(1))  # 1
cache.put(3, 3)
print(cache.get(2))  # -1
```

## Troubleshooting

### "Python interpreter is still loading..."

**Problem:** Pyodide hasn't finished initializing

**Solution:** Wait 5-10 seconds and try again. The button will enable when ready.

### "Failed to load Python interpreter"

**Problem:** CDN is unreachable or blocked

**Solutions:**
- Check internet connection
- Check if CDN is blocked by firewall/proxy
- Try a different network

### Code runs but no output

**Problem:** Code doesn't use `print()`

**Solution:** Explicitly print values:
```python
result = 5 + 3
print(result)  # Need this to see output
```

### Import errors

**Problem:** Package not available in Pyodide

**Solution:** Check if package is available at:
https://pyodide.org/en/stable/usage/packages-in-pyodide.html

## Comparison with Other Solutions

| Solution | Pros | Cons |
|----------|------|------|
| **Pyodide** | ✅ Full Python 3.11<br>✅ NumPy/SciPy<br>✅ No server needed | ❌ Large download<br>❌ Load time |
| **Brython** | ✅ Smaller size<br>✅ Fast startup | ❌ Not full Python<br>❌ Limited packages |
| **Skulpt** | ✅ Small<br>✅ Educational focus | ❌ Python 2.x only<br>❌ Very limited |
| **Server-side** | ✅ Full Python<br>✅ All packages | ❌ Security risks<br>❌ Server costs |

**For technical interviews, Pyodide is the best choice** because it provides full Python support without security concerns.

## Future Enhancements

Potential additions:
- [ ] Pre-load common packages (NumPy, Pandas)
- [ ] Package installation UI
- [ ] Matplotlib/Plotly visualization support
- [ ] Python code snippets/templates
- [ ] Performance profiling
- [ ] Memory usage display

## Resources

- [Pyodide Documentation](https://pyodide.org/)
- [Pyodide GitHub](https://github.com/pyodide/pyodide)
- [Available Packages](https://pyodide.org/en/stable/usage/packages-in-pyodide.html)
- [API Reference](https://pyodide.org/en/stable/usage/api/js-api.html)
