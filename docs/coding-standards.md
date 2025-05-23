# StrongLog V1.0 Coding Standards and Patterns

**Version:** 0.1
**Date:** 2025-05-22
**Author:** 3 Arkitekten (AI)

This document outlines the coding standards, patterns, and best practices to be followed during the development of the StrongLog V1.0 Progressive Web Application.

## 1. Architectural / Design Patterns Adopted

The following key high-level architectural patterns have been adopted for StrongLog V1.0, as detailed in `docs/architecture.md`:

* **Client-First Architecture:** The application prioritizes client-side logic and data storage, with full offline functionality.
* **Progressive Web App (PWA):** The primary delivery model, leveraging service workers for caching and offline capabilities.
* **Component-Based UI (React):** The UI is built using React's component model, promoting reusability and modularity.
* **Model-View-Update (MVU-like patterns with State Management):** State management (Zustand, Dexie.js with `useLiveQuery`) follows patterns where UI reacts to state changes, and user actions update the state.
* **Offline-First Design:** The application is designed to function primarily with local data, treating network connectivity as an enhancement for optional features like synchronization.
* **Service/Engine Layer in Web Workers:** Computationally intensive logic (FRX, FRY, FRZ) is offloaded to Shared Web Workers to maintain UI responsiveness.
* **Modular Feature Design:** Code is organized into feature-based modules to enhance cohesion and reduce coupling, as outlined in `docs/project-structure.md`.

## 2. Coding Standards

These standards apply to all TypeScript and React code written for the project.

* **Primary Language:** **TypeScript** `~5.4.x`.
  * Enable and adhere to `strict` mode in `tsconfig.json`.
  * Use explicit types wherever possible; avoid `any` unless absolutely necessary and justified.
* **Primary Runtime (Development & Tooling):** **Node.js** `^20.11.x` (LTS) or `^22.x.x` (Current). Client-side code runs in modern browsers.
* **Style Guide & Linter:**
  * **ESLint:** `~8.x.x` or `~9.x.x`.
    * Configuration will use a base like `eslint:recommended`, `plugin:react/recommended`, `plugin:react-hooks/recommended`, `plugin:@typescript-eslint/recommended`.
    * Specific rules will be defined in `.eslintrc.cjs`.
  * **Prettier:** `~3.x.x`.
    * Used for automatic code formatting to ensure consistent style.
    * Configuration will be in `.prettierrc.cjs`.
  * **Integration:** ESLint and Prettier will be integrated into the development workflow via Git hooks (Husky + lint-staged) and IDE settings.
* **Naming Conventions:**
  * **Variables & Functions:** `camelCase` (e.g., `workoutData`, `calculateE1RM`).
  * **Constants:** `UPPER_SNAKE_CASE` (e.g., `DEFAULT_REST_TIME_SECONDS`).
  * **Classes, Interfaces, Types, Enums, React Components (TSX):** `PascalCase` (e.g., `WorkoutLog`, `IProgressionRule`, `ThemeType`, `UserSettingsPage`).
  * **Files:**
    * React Components: `PascalCase.tsx` (e.g., `ExerciseCard.tsx`).
    * Other TS files (hooks, services, utilities, types): `camelCase.ts` or `kebab-case.ts` (e.g., `useTimer.ts`, `e1rmCalculator.ts` or `e1rm-calculator.ts`). Prefer `camelCase.ts` for consistency with variables/functions if no strong reason for kebab-case.
    * Test Files: `*.test.ts(x)` or `*.spec.ts(x)` co-located with the source file (e.g., `ExerciseCard.test.tsx`, `e1rmCalculator.test.ts`).
* **File Structure:** Adhere to the layout defined in `docs/project-structure.md`.
  * Use barrel files (`index.ts`) judiciously to export public APIs of modules/features.
* **Asynchronous Operations:**
  * **`async/await`** must be used for all Promise-based asynchronous operations (e.g., Dexie.js calls, Comlink worker calls, fetch API for sync) for better readability and error handling.
  * Avoid raw Promises (`.then().catch()`) where `async/await` can provide clearer syntax, unless specific chaining benefits are needed.
* **Type Safety & Definitions:**
  * Leverage TypeScript's strict type system. Enable `strictNullChecks`, `noImplicitAny`, etc., in `tsconfig.json`.
  * Define clear interfaces and types for all data structures, function signatures, and component props.
  * Global/shared types should reside in `src/types/`. Feature-specific types should be co-located within the feature module.
  * Use **Zod** for runtime validation of critical data structures, especially for data entering the system (e.g., from IndexedDB if schema migrations are complex, worker communication, API responses for sync) and for validating rule definitions.
* **Comments & Documentation:**
  * Write clear, concise comments to explain complex logic, assumptions, or workarounds. Avoid commenting obvious code.
  * Use **JSDoc/TSDoc** format for documenting functions, classes, interfaces, and important modules, especially for public APIs of services and shared components.
    * Example:

          ```typescript
          /**
           * Calculates the Estimated 1 Rep Max (e1RM) using the Epley formula.
           * @param weight - The weight lifted (kg or lbs).
           * @param reps - The number of repetitions performed.
           * @returns The calculated e1RM.
           */
          export function calculateEpleyE1RM(weight: number, reps: number): number {
            if (reps === 0) return 0;
            if (reps === 1) return weight;
            return weight * (1 + reps / 30);
          }
          ```

  * `README.md` files should be considered for complex feature modules or services to explain their purpose and usage.
* **Dependency Management:**
  * **PNPM** is the selected package manager. Use `pnpm install`, `pnpm add`, etc.
  * **Policy on Adding Dependencies:**
    * Evaluate the need for any new dependency carefully. Prefer well-maintained, reputable libraries with good community support and minimal bundle size impact.
    * Discuss with the team before adding significant new dependencies.
    * Regularly review and update dependencies to patch security vulnerabilities (`pnpm audit`).
* **React-Specific Conventions:**
  * Functional components with Hooks are preferred over class components.
  * Follow rules of hooks (e.g., call hooks at the top level).
  * Use descriptive names for components and props.
  * Prop types should be clearly defined using TypeScript interfaces.
  * Use `React.memo`, `useMemo`, `useCallback` judiciously for performance optimization where profiling indicates a need.
  * Avoid direct DOM manipulation where possible; use React's declarative approach.
* **Tailwind CSS / shadcn/ui:**
  * When using Tailwind CSS via `shadcn/ui` components or directly, strive for readability by creating reusable component abstractions for common UI patterns rather than overly long lists of utility classes in JSX.
  * Customize `tailwind.config.cjs` for theme colors, fonts, and spacing to maintain consistency.
  * Components from `shadcn/ui` are copied into `src/components/ui` and can be modified as needed.

## 3. Error Handling Strategy

A consistent error handling strategy is vital for a robust application.

* **General Approach:**
  * Use TypeScript's error handling mechanisms (`try...catch` blocks for synchronous code and `async/await` with `try...catch` for asynchronous operations).
  * Define custom error classes (e.g., extending `Error`) for specific application error types (e.g., `ValidationError`, `DatabaseError`, `SyncError`) to allow for more granular error handling and reporting.
* **Logging:**
  * **Client-Side Logging:** Use `console.debug()`, `console.info()`, `console.warn()`, and `console.error()` appropriately.
    * `debug`: For detailed diagnostic information useful during development.
    * `info`: For general application flow information (e.g., engine started, sync completed).
    * `warn`: For recoverable issues or potential problems that don't halt execution.
    * `error`: For critical errors that disrupt functionality.
  * **Context:** Logged messages should include sufficient context (e.g., component/service name, function name, relevant data IDs) to aid debugging.
  * **Production Logging:** For production, client-side errors should ideally be reported to an external error tracking service (e.g., Sentry, LogRocket - TBD if implemented for V1.0). If not, `console.error` is the minimum.
* **Specific Handling Patterns:**
  * **Data Validation Errors (Zod):** When Zod validation fails, provide clear, user-friendly feedback if the error stems from user input. Log detailed validation errors for debugging.
  * **Dexie.js (IndexedDB) Errors:** Wrap Dexie.js operations in `try...catch` blocks. Handle common errors like `QuotaExceededError`, `ConstraintError`, etc., gracefully. Provide user feedback if an operation fails due to storage issues.
  * **Web Worker (Comlink) Errors:** Errors in Web Workers should be caught within the worker and propagated back to the main thread (Comlink supports this). The main thread should handle these errors appropriately (e.g., update UI, log).
  * **API Calls (Optional Sync):**
    * Handle network errors (e.g., offline, server unavailable).
    * Handle HTTP error responses (4xx, 5xx) from the backend.
    * Implement a retry mechanism with exponential backoff for transient network/server errors when attempting to sync.
  * **User-Facing Errors:** Present clear, non-technical error messages to the user when something goes wrong that affects them. Provide guidance if possible (e.g., "Failed to save workout. Please try again later.").
* **Graceful Degradation vs. Critical Failure:**
  * **Critical Failure:** For core operations (e.g., saving a workout to IndexedDB), failure might require clear indication and preventing further dependent actions.
  * **Graceful Degradation:** For non-critical features or enhancements (e.g., if a complex analytic calculation fails), the app should degrade gracefully without crashing (e.g., show a message "Analytics unavailable" instead of a blank screen). Optional sync failures should not break core offline functionality.

## 4. Security Best Practices (Client-Side Focus)

While StrongLog is client-first, security is still important, especially concerning data integrity and potential interactions if sync is enabled.

* **Input Sanitization/Validation (Zod):**
  * All user input (forms, settings) must be validated using Zod before being processed or stored.
  * Data coming from Web Workers or being prepared for IndexedDB/sync should also be validated against expected schemas.
* **Secrets Management (Client-Side):**
  * **No Hardcoded Secrets:** API keys or other secrets for the optional backend sync must NOT be hardcoded in the client-side PWA bundle.
  * **Token-Based Auth for Sync:** If user accounts are implemented for sync, authentication will be token-based (e.g., JWTs). These tokens will be securely stored (e.g., in memory, potentially with short-lived persistence in `localStorage` or `sessionStorage` if appropriate for PWA session management, but *not* IndexedDB for raw tokens if avoidable). Secure handling of these tokens is paramount.
  * For V1.0, detailed secrets management for the client's interaction with its *own* backend for sync will depend on the auth flow chosen for that optional feature. Reference `docs/environment-vars.md` for build-time configurations, not runtime secrets.
* **Dependency Security:**
  * Regularly audit project dependencies for known vulnerabilities using `pnpm audit`.
  * Keep dependencies updated to patched versions.
* **DOM XSS Prevention:**
  * React inherently helps prevent many XSS vulnerabilities by escaping content rendered in JSX.
  * Avoid using `dangerouslySetInnerHTML` unless absolutely necessary and the source of the HTML is trusted and sanitized.
  * Be cautious with third-party libraries that might manipulate the DOM directly.
* **Content Security Policy (CSP):**
  * Consider implementing a Content Security Policy (via `<meta>` tag or HTTP headers from the hosting platform) to mitigate XSS and other injection attacks by restricting the sources from which content can be loaded.
* **Local Data Security (IndexedDB):**
  * IndexedDB is sandboxed per origin by the browser. While not encrypted by default at rest by the browser in a way that protects against local physical access to the device if unlocked, it's protected by standard browser security mechanisms from other origins. No highly sensitive PII beyond what's necessary for a fitness app should be stored.

## Change Log

| Change        | Date         | Version | Description                                      | Author            |
|---------------|--------------|---------|--------------------------------------------------|-------------------|
| Initial draft | 2025-05-22   | 0.1     | Initial draft of coding standards and patterns. | 3 Arkitekten (AI) |
