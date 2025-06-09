import '@testing-library/jest-dom';
import { afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
// Import fake-indexeddb to mock IndexedDB
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';

// Set up fake IndexedDB before all tests
beforeAll(() => {
  // Ensure global.indexedDB is set to the fake implementation
  global.indexedDB = new IDBFactory();
});

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
});
