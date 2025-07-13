// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock global objects for tests
if (typeof window !== 'undefined') {
  // Create a simple mock function that doesn't use jest
  const createMockFn = () => {
    return () => {};
  };

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: createMockFn(), // Deprecated
      removeListener: createMockFn(), // Deprecated
      addEventListener: createMockFn(),
      removeEventListener: createMockFn(),
      dispatchEvent: createMockFn(),
    }),
  });
}

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Extend Jest globals
declare global {
  // Use module augmentation instead of namespace
  interface JestMatchers<R> {
    toBeInTheDocument(): R;
    toHaveAttribute(attr: string, value?: string): R;
    toHaveTextContent(text: string | RegExp): R;
    toBeVisible(): R;
    toBeEmpty(): R;
  }
}
