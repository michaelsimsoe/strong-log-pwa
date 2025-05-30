import '@testing-library/jest-dom';

declare module 'vitest' {
  interface Assertion<T = unknown> extends jest.Matchers<void, T> {
    // Add at least one property to avoid the 'interface declares no members' warning
    toBeInTheDocument(): void;
  }

  interface AsymmetricMatchersContaining extends jest.Matchers<void, unknown> {
    // Add at least one property to avoid the 'interface declares no members' warning
    toBeInTheDocument(): void;
  }
}
