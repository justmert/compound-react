// Add any global test setup here
// This file is run before each test file

// Mock console.error to avoid noisy test output
// but still keep track of errors for debugging
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning:') || args[0].includes('Error:'))
  ) {
    return; // Suppress React warnings and errors in tests
  }
  originalConsoleError(...args);
}; 