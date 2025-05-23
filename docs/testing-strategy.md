# StrongLog V1.0 Testing Strategy

**Version:** 0.1
**Date:** 2025-05-22
**Author:** 3 Arkitekten (AI)

This document details the testing strategy for the StrongLog V1.0 Progressive Web Application, covering different testing levels, tools, scope, and integration into the development process.

## 1. Overall Philosophy & Goals

* **Philosophy:** We will adopt a comprehensive testing approach, emphasizing automation at multiple levels (unit, integration, E2E) to ensure high quality and enable rapid, confident development iterations. We aim to follow principles similar to the "Testing Trophy," ensuring a good balance of test types focusing on confidence and speed. Key focus areas include core business logic within the client-side engines (FRX, FRY, FRZ), data integrity in IndexedDB (Dexie.js), full offline functionality, and PWA-specific behaviors.
* **Goals:**
  * Achieve high code coverage for critical modules, particularly the client-side engines and data access layer.
  * Prevent regressions in core functionality and user flows.
  * Ensure all V1.0 features (including advanced logging, progression, programs, goals, analytics, data import/export) function correctly offline.
  * Validate the correctness of the Progression Engine (FRX) logic, Program Management (FRY) scheduling, and Goal Setting (FRZ) calculations under diverse scenarios.
  * Verify data integrity for all user-defined data.
  * Ensure the application meets performance NFRs (PWA load time, UI interaction latency, engine processing time) on target mobile devices.
  * Enable confident refactoring and continuous integration/deployment.

## 2. Testing Levels

### 2.1. Unit Tests

* **Scope:** Test individual functions, methods, React components (UI and logic), custom hooks, and modules in isolation. Focus on business logic, calculations, conditional paths, and component rendering based on props/state.
* **Tools:**
  * **Vitest:** Test runner and assertion library.
  * **React Testing Library (RTL):** For testing React components by interacting with them as a user would.
* **Mocking/Stubbing:** Vitest's built-in mocking capabilities (`vi.fn()`, `vi.mock()`) will be used to isolate units by mocking dependencies (e.g., Dexie.js calls, Comlink worker calls, other services).
* **Location:** Co-located with the source files they test (e.g., `MyComponent.test.tsx` alongside `MyComponent.tsx`).
* **Expectations:** Cover all significant logic paths and component states. Tests should be fast and run frequently during development and in CI.

### 2.2. Integration Tests

* **Scope:** Verify the interaction and collaboration between multiple internal components or modules within the application. For example, testing a feature's UI components interacting with its local services and state management, or testing the interaction between application logic and the Dexie.js data access layer. These tests will focus on the contracts and data flow between integrated parts. May involve mocking external boundaries like Web Workers or the optional backend API.
* **Tools:**
  * **Vitest:** Test runner and assertion library.
  * **React Testing Library (RTL):** For testing integrated component trees.
  * Mock Service Worker (MSW) or similar for mocking API calls (for sync service integration tests).
* **Location:** `tests/integration/` directory, potentially mirroring feature structure.
* **Expectations:** Slower than unit tests but provide more confidence in how parts of the system work together. Run in CI.

### 2.3. End-to-End (E2E) / Acceptance Tests

* **Scope:** Test the entire application flow from an end-user perspective, interacting with the PWA through its UI in real browser environments. Validate complete user journeys defined in epics, including PWA installability, full offline functionality for all V1.0 features, data persistence across sessions, and interaction with client-side engines through the UI.
* **Tools:**
  * **Playwright:** For browser automation and E2E test execution across Chromium, Firefox, and WebKit.
* **Environment:** Run against a fully built and locally served PWA (e.g., `vite preview`) or against deployed Staging/QA environments. Playwright's capabilities for service worker interaction and offline simulation will be leveraged.
* **Location:** `tests/e2e/` directory.
* **Expectations:** Cover critical user paths and PWA features. These are the slowest tests and will run in CI, especially before releases. Key focus on validating Epic 8.4 requirements.

### 2.4. Manual / Exploratory Testing

* **Scope:** Address areas difficult or inefficient to automate, such as usability testing for complex configuration UIs (rules, programs), exploratory testing for edge cases, visual consistency checks, and real-world device compatibility beyond automated E2E tests.
* **Process:** Conducted periodically by team members (developers, PO, QA if available) based on test plans or free-form exploration. Feedback logged as issues.

## 3. Specialized Testing Types

### 3.1. Performance Testing

* **Scope & Goals:**
  * Validate PWA load time (<3s initial, <2s cached) and UI interaction latency (<200ms response) as per NFR1.
  * Measure the performance of client-side engine calculations (FRX, FRY, FRZ) to ensure they don't degrade UI performance on target mobile devices.
  * Test efficient IndexedDB (Dexie.js) operations with representative large data sets.
* **Tools:**
  * **Browser Developer Tools (Performance Panel, Lighthouse):** For profiling JavaScript execution, rendering, PWA audits, and measuring Core Web Vitals.
  * **React Profiler API:** To measure rendering performance of specific React component trees.
  * **Playwright:** Can be used to automate user scenarios and measure performance metrics (e.g., custom metrics, LCP, FID) during E2E tests.
  * Custom benchmarks within Vitest for specific algorithms if needed.
* **Process:** Integrate performance checks into CI where possible (e.g., Lighthouse scores). Conduct targeted profiling on key features and devices, especially before releases.

### 3.2. Accessibility Testing (UI)

* **Scope & Goals:** Ensure the PWA is usable by people with a wider range of abilities, targeting WCAG 2.1 Level AA where feasible, as per Epic 8.3.
* **Tools:**
  * **Automated Tools:** `axe-core` (e.g., via `@axe-core/react` or browser extensions like Axe DevTools). Lighthouse accessibility audit.
  * **Manual Checks:** Keyboard-only navigation testing, screen reader testing (e.g., NVDA, VoiceOver, TalkBack), color contrast checking.
* **Process:** Integrate automated accessibility checks into CI. Perform manual accessibility reviews as part of UI polish and pre-release testing (Epic 8.3).

### 3.3. PWA-Specific Testing (Covered in E2E & Manual)

* **Scope:** Installability ("Add to Home Screen"), service worker lifecycle (updates, caching strategies), offline launch and full offline functionality of all V1.0 features, manifest integrity.
* **Tools & Process:** Primarily validated through E2E tests using Playwright (which can interact with service workers and simulate offline) and manual testing on target devices/browsers. Lighthouse PWA audit.

### 3.4. Data Import/Export Testing

* **Scope:** Validate StrongLifts data import (parsing, mapping, conflict handling) and comprehensive V1.0 data export (CSV/JSON for all entities) as per Epic 7.
* **Process:** Use sample StrongLifts export files for import testing. For export, verify file formats and data integrity against known local data. Automate parts of this in integration or E2E tests.

## 4. Test Data Management

* **Unit/Integration Tests:** Use small, focused, mocked, or hardcoded datasets specific to the test case.
* **E2E/Performance Tests:** Requires more realistic and potentially larger datasets.
  * **Seeding Scripts:** Develop scripts (e.g., in `scripts/seed-db.ts`) to populate IndexedDB (via Dexie.js) with predefined sets of data for testing specific scenarios (e.g., user with extensive workout history, multiple active programs, many rules).
  * **Data Generation Utilities:** Create utilities to generate varied test data for different user profiles or scenarios.
  * **Resetting State:** Ensure a reliable way to reset the application's state (IndexedDB) to a known baseline before E2E test runs or suites. Playwright's browser contexts can help isolate test runs.
* **User-Configurable Data:** For FRX rules, FRY programs, and FRZ goals, test cases will involve creating these entities via the UI (E2E) or programmatically (integration) to ensure the engines process them correctly.

## 5. CI/CD Integration

* **Automated Execution:** All unit and integration tests (Vitest) will run automatically on every push to any branch and on pull requests in the CI/CD pipeline (GitHub Actions).
* **E2E Test Execution:** E2E tests (Playwright) will run on pushes to main/release branches and potentially nightly or on-demand for PRs due to their longer execution time.
* **Pipeline Failure:** A failing test at any level (unit, integration, E2E) will fail the CI build, preventing deployment of faulty code.
* **Reporting:** Test results and code coverage reports (from Vitest) will be published and reviewed.

## Change Log

| Change        | Date         | Version | Description                                      | Author            |
|---------------|--------------|---------|--------------------------------------------------|-------------------|
| Initial draft | 2025-05-22   | 0.1     | Initial draft of the Testing Strategy document. | 3 Arkitekten (AI) |
