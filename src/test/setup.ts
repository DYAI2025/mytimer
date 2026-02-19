/**
 * Vitest Test Setup
 */

// Mock requestAnimationFrame for Node.js environment
global.requestAnimationFrame = (callback: FrameRequestCallback): number => {
  return setTimeout(() => callback(Date.now()), 16) as unknown as number;
};

global.cancelAnimationFrame = (id: number): void => {
  clearTimeout(id);
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
