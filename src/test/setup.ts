/**
 * Vitest Test Setup
 */

// Mock requestAnimationFrame for Node.js environment
// This version works with both real and fake timers
let rafIdCounter = 0;
const rafCallbacks = new Map<number, FrameRequestCallback>();

global.requestAnimationFrame = (callback: FrameRequestCallback): number => {
  const id = ++rafIdCounter;
  rafCallbacks.set(id, callback);
  
  // Use setTimeout to trigger the callback
  // When using fake timers, tests must call vi.advanceTimersByTime() to execute
  setTimeout(() => {
    if (rafCallbacks.has(id)) {
      rafCallbacks.delete(id);
      callback(Date.now());
    }
  }, 16);
  
  return id;
};

global.cancelAnimationFrame = (id: number): void => {
  rafCallbacks.delete(id);
};

// Mock performance.now() if not available
if (typeof performance === 'undefined') {
  (global as any).performance = {
    now: () => Date.now(),
  };
}

// Suppress console errors during tests (optional)
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  // Filter out React warnings that are expected in test environment
  const message = args[0]?.toString() || '';
  if (
    message.includes('ReactDOM.render') ||
    message.includes('act(') ||
    message.includes('Warning:')
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};
