import '@testing-library/jest-dom';
import { afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
// Import fake-indexeddb to mock IndexedDB
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';

// Set up fake IndexedDB before all tests
beforeAll(() => {
  // Ensure global.indexedDB is set to the fake implementation
  global.indexedDB = new IDBFactory();

  // Mock ResizeObserver which is not available in the test environment
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock window.matchMedia which is not available in the test environment
  global.matchMedia = vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
});
