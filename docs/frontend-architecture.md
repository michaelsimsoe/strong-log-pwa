# StrongLog V1.0 Frontend Architecture

**Version:** 0.1
**Date:** 2025-05-22
**Author:** 3 Arkitekten (AI)

## 1. Introduction

This document details the frontend architecture for the StrongLog V1.0 Progressive Web Application (PWA). It builds upon the `docs/architecture.md` (High-Level Architecture Overview) and complements the `docs/project-structure.md` by providing specific guidance on how React components, routing, state management, and other frontend concerns will be handled.

The goal is to establish clear patterns and best practices to ensure the frontend is performant, maintainable, scalable, accessible, and provides an excellent user experience, especially given its client-first and offline-first nature.

## 2. Core Frontend Principles

The frontend development will adhere to the following core principles:

- **Component-Based Architecture (React):** The UI will be constructed using React's component model, emphasizing reusability, encapsulation, and a clear separation of concerns. We will leverage functional components and hooks extensively.
- **Mobile-First & Responsive Design:** The PWA will be designed with a mobile-first approach, ensuring a seamless experience on smaller screens. All UI elements and layouts must be fully responsive and adapt gracefully to various screen sizes (phones, tablets, and desktops). Tailwind CSS will be instrumental in achieving this.
- **Accessibility (A11y):** StrongLog is committed to being accessible. We will target WCAG 2.1 Level AA compliance where feasible. This will be supported by:
  - Using accessible primitives from Radix UI (via `shadcn/ui`).
  - Semantic HTML.
  - Keyboard navigability.
  - Sufficient color contrast.
  - ARIA attributes where necessary.
  - Regular accessibility audits (manual and automated) as outlined in `docs/testing-strategy.md`.
- **Performance by Design:** Frontend performance is critical for user satisfaction. Strategies will include:
  - Efficient component rendering (memoization, avoiding unnecessary re-renders).
  - Code splitting and lazy loading of routes and components.
  - Optimized asset handling (via Vite).
  - Efficient state management to prevent performance bottlenecks.
  - Minimizing main thread work, especially by offloading to Web Workers where appropriate.
- **Predictable State Management:** Utilizing Zustand for global UI state and `dexie-react-hooks` for reactive data from IndexedDB to ensure a clear, predictable, and efficient data flow within the UI.
- **Progressive Enhancement:** While building a modern PWA, ensure core functionality remains accessible even if some advanced JavaScript features or browser APIs are not available (though our target is modern browsers).

## 3. React Component Strategy

This section outlines our approach to designing, organizing, and styling React components to ensure a modular, maintainable, and scalable frontend.

### 3.1. Component Organization

- **Feature-Based Co-location:** As detailed in `docs/project-structure.md` (Version 0.3), components primarily specific to a feature will be co-located within that feature's directory (e.g., `src/features/workout-logging/components/`). This promotes modularity and makes it easier to find and manage feature-specific UI elements.
- **Shared UI Components:**
  - **`src/components/ui/`**: This directory will contain the UI components added from **`shadcn/ui`**. These components are copied into our codebase, allowing for full customization and ownership.
  - **`src/components/layout/`**: Houses structural components that define the overall page layouts, such as `Navbar`, `Sidebar`, `PageWrapper`, etc..
  - **`src/components/shared/`**: For truly global, application-agnostic, reusable UI components developed specifically for StrongLog that are not part of `shadcn/ui` or specific layouts (e.g., `ConfirmationModal`, `EmptyStateIndicator`).

### 3.2. Component Design Patterns

- **Functional Components with Hooks:** All new components will be functional components utilizing React Hooks for state, side effects, context, and other React features. Class components will not be used.
- **Separation of Concerns:**
  - **Presentational Components:** Focus on rendering UI based on props. They should be kept simple and free of business logic or direct data fetching. Many `shadcn/ui` components will serve this purpose.
  - **Container Components (or Hook-Driven Logic):** While the traditional "container component" pattern can be used, a more modern approach is to use custom hooks to encapsulate business logic, state management interaction (Zustand selectors/actions, `useLiveQuery`), and side effects. Page-level components (often in `src/features/**/pages/`) or feature-specific "smart" components will then use these hooks to manage data and pass props to presentational components.
  - **Example:** A `WorkoutList` presentational component might receive `workouts` as a prop. A `useUserWorkouts` custom hook could be responsible for fetching these workouts using `useLiveQuery` and providing loading/error states. The `WorkoutHistoryPage` would then use this hook and pass the data to `WorkoutList`.
- **Custom Hooks for Reusable UI Logic:** Non-presentational UI logic that is shared among multiple components should be extracted into custom hooks (e.g., `useTimer`, `useFormValidation` specific to a complex form, `usePWAInstallPrompt`). Global custom hooks reside in `src/hooks/`, while feature-specific ones are in `src/features/[featureName]/hooks/`.
- **Props:**
  - Props should be clearly defined using TypeScript interfaces.
  - Pass only necessary props to components. Avoid prop drilling excessively; use state management (Zustand, Context API for localized contexts) or component composition to manage state at appropriate levels.
- **Composition over Inheritance:** Favor component composition to build complex UIs from smaller, reusable pieces. This is a core React principle.

### 3.3. Styling with Tailwind CSS & `shadcn/ui`

- **`shadcn/ui` Integration:** Components from `shadcn/ui` are added via its CLI and the code is copied directly into `src/components/ui/`. This allows for:
  - **Full Customization:** Modifying the component's structure, styles (using Tailwind utility classes), and behavior to fit StrongLog's specific design language.
  - **Dependency Management:** Components become part of our codebase, reducing reliance on an external component library's update cycle for visual changes.
- **Tailwind CSS Best Practices:**
  - **Utility-First:** Embrace the utility-first nature of Tailwind CSS for applying styles directly in the JSX.
  - **Component Abstraction:** For common UI patterns or highly repeated combinations of utility classes, create dedicated React components to encapsulate these styles and improve JSX readability and maintainability. Avoid overly long strings of utility classes directly in complex components.
    - **Example:** Instead of repeating `flex items-center justify-between p-4 border-b` in multiple list items, create a `ListItemWrapper` component that applies these classes.
  - **Theme Configuration:** Utilize `tailwind.config.cjs` to define project-specific design tokens (colors, spacing, fonts, breakpoints) to ensure UI consistency and align with StrongLog's brand (if applicable).
  - **Readability:** Use Prettier with the Tailwind Prettier plugin (`prettier-plugin-tailwindcss`) to automatically sort utility classes, improving readability.
  - **Avoid `@apply` where possible:** While Tailwind's `@apply` can be used to extract component classes into CSS, it should be used sparingly. Prefer component abstraction in React for better encapsulation and to keep styling logic closer to the component structure.
- **Global Styles:** Global styles (e.g., base font settings, CSS resets if not fully covered by Tailwind's preflight) will be defined in `src/styles/global.css`.

### 3.4. Accessibility in Components

- **Leverage Radix UI:** `shadcn/ui` components are built on Radix UI primitives, which are designed with accessibility (WAI-ARIA standards, keyboard navigation, focus management) as a core principle. This provides a strong accessible foundation.
- **Semantic HTML:** Use appropriate HTML5 semantic elements (`<nav>`, `<main>`, `<article>`, `<aside>`, `<button>`, etc.) to provide inherent meaning and structure.
- **ARIA Attributes:** For custom components or complex interactions not fully covered by Radix, apply ARIA attributes correctly to define roles, states, and properties for assistive technologies.
- **Keyboard Navigation:** Ensure all interactive elements are focusable and operable via keyboard alone. Test tab order and focus indicators.
- **Alternative Text:** Provide meaningful alternative text for images and icons that convey information.
- **(Refer to `docs/testing-strategy.md` for accessibility testing procedures and Epic 8.3 for accessibility review requirements).**

## 4. Routing Strategy

A clear and robust routing strategy is essential for navigating the StrongLog V1.0 PWA and providing users with shareable links to specific parts of the application (deep linking).

### 4.1. Library Selection

- **Recommendation:** **React Router (`react-router` latest stable version, e.g., v7.x)**
- **Rationale:**
  - **De Facto Standard:** React Router is the most widely used and mature routing library for React applications, with extensive documentation, community support, and a rich feature set.
  - **Declarative Routing:** It enables a declarative approach to routing, where routes are defined as React components, fitting naturally into the React paradigm.
  - **Hooks-Based API:** Modern versions (v6+) offer a powerful hooks-based API (e.g., `useNavigate`, `useParams`, `useLocation`, `useRoutes`) that simplifies route configuration and interaction within functional components.
  - **Feature Rich:** Supports essential features like route parameters, nested routes, programmatic navigation, search parameter handling, and outlet-based rendering for layouts.
  - **Community & Ecosystem:** Benefits from a vast ecosystem of related libraries and tools.

### 4.2. Route Structure and Organization

- **Route Definitions:** Routes will primarily be defined in a central location, likely within `src/App.tsx` or a dedicated `src/routes.tsx` file, using the `useRoutes` hook or `<Routes>` component from React Router.
- **Page Components:** Routes will map to page-level components, which are typically located within their respective feature folders (e.g., `src/features/dashboard/pages/DashboardPage.tsx`, `src/features/workout-logging/pages/ActiveWorkoutPage.tsx`) as outlined in `docs/project-structure.md` (Version 0.3). This co-location enhances modularity.
- **Layouts:** Nested routes and outlet components (`<Outlet />`) from React Router will be used to implement shared layouts (e.g., a main application layout with a navbar and sidebar, wrapping feature-specific pages) defined in `src/components/layout/`.

  ```typescript
  // Example conceptual route structure (e.g., in App.tsx or routes.tsx)
  // const routes = useRoutes([
  //   {
  //     path: '/',
  //     element: <MainAppLayout />, // Contains <Outlet />
  //     children: [
  //       { index: true, element: <DashboardPage /> }, // Default child for '/'
  //       { path: 'workouts/log', element: <ActiveWorkoutPage /> },
  //       { path: 'workouts/:workoutId', element: <WorkoutDetailPage /> },
  //       { path: 'programs', element: <ProgramsListPage /> },
  //       { path: 'programs/:programId', element: <ProgramDetailPage /> },
  //       // ... other main app routes
  //       { path: 'settings', element: <SettingsPage /> }, // Could be a nested route too
  //     ]
  //   },
  //   { path: '/login', element: <LoginPage /> }, // Example if we had a dedicated login page for sync
  //   { path: '*', element: <NotFoundPage /> } // Catch-all for 404
  // ]);
  ```

### 4.3. Key Routing Features to Utilize

- **Route Parameters:** For dynamic routes, such as viewing a specific workout log (`/workouts/:workoutId`) or program (`/programs/:programId`), route parameters will be used. These parameters will be accessed in components using the `useParams` hook.
- **Nested Routes:** For hierarchical UI structures where parts of the UI are shared (e.g., a settings page with multiple sub-sections), nested routes will be employed. Parent routes can render an `<Outlet />` for their child routes.
- **Programmatic Navigation:** The `useNavigate` hook will be used for navigating users programmatically based on application logic (e.g., after saving a workout, navigate to its summary page; after login for sync, navigate to dashboard).
- **Search Parameters (`URLSearchParams`):** The `useSearchParams` hook will be used for managing URL query parameters, which can be useful for filtering lists or passing transient state via the URL.
- **Link Component:** The `<Link>` component from `react-router` will be used for declarative navigation between routes to ensure client-side routing without full page reloads.

### 4.4. Code Splitting and Lazy Loading Routes

- **Strategy:** To improve initial PWA load times and overall performance, route-based code splitting will be implemented using `React.lazy()` and `<Suspense>`.
- **Implementation:** Page-level components associated with routes will be dynamically imported:

  ```typescript
  // const ActiveWorkoutPage = React.lazy(() => import('./features/workout-logging/pages/ActiveWorkoutPage'));
  // const SettingsPage = React.lazy(() => import('./features/settings/pages/SettingsPage'));

  // // In route definitions:
  // <Suspense fallback={<PageLoadingSpinner />}>
  //   <Routes>
  //     <Route path="/workouts/log" element={<ActiveWorkoutPage />} />
  //     <Route path="/settings" element={<SettingsPage />} />
  //     {/* ... other routes */}
  //   </Routes>
  // </Suspense>
  ```

- **Benefits:** This ensures that the JavaScript code for a specific page is only loaded when the user navigates to that route, reducing the initial bundle size and improving Time To Interactive (TTI) and First Contentful Paint (FCP). Vite handles the underlying chunk creation effectively.

### 4.5. Protected Routes (Minimal for V1.0)

- **Context:** Most of StrongLog V1.0 is designed for anonymous usage with local data. The primary scenario for "protected" routes would be related to managing the optional sync account or accessing features strictly tied to having an account (e.g., a page to manage sync preferences or view sync history).
- **Approach for V1.0:**
  - If a user has opted into sync and created an account, a minimal user context (e.g., indicating logged-in status for sync) might be established.
  - Routes leading to account-specific settings or sync management pages can be conditionally rendered or wrapped in a simple HOC/custom hook that checks this sync user context.
  - Given the client-first nature, complex role-based access control is not a V1.0 concern for the core application features.

### 4.6. Deep Linking for PWA

- **Importance:** Deep links (unique URLs for specific content or views) enhance PWA discoverability and user engagement, allowing users to bookmark or share specific states/pages.
- **Strategy:**
  - Our routing strategy with path parameters (e.g., `/workouts/:workoutId`, `/programs/:programId/workout/:workoutOrder`) naturally supports deep linking.
  - The PWA's service worker (configured via `vite-plugin-pwa`) must be set up to handle navigation to these deep links correctly when offline, typically by serving the `index.html` app shell for all paths and letting React Router take over client-side. This is a common PWA pattern, often called "App Shell" or "Single Page App" routing fallback.
  - Ensure `manifest.json` `start_url` points to a valid entry point.

## 5. State Management Integration (UI Perspective)

Effective state management is crucial for StrongLog V1.0's complex, reactive, and offline-first UI. This section outlines how React components will interact with our selected state management tools: **Zustand** for global UI and transient state, and **Dexie.js with `dexie-react-hooks`** (specifically `useLiveQuery`) for reactive access to persistent data stored in IndexedDB.

### 5.1. Zustand for Global UI & Transient State

- **Purpose:** Zustand will manage global UI state (e.g., current theme, global loading indicators, modal visibility states) and other transient application states that don't need to be persisted in IndexedDB or are not directly tied to database entities.
- **Store Structure:**
  - Stores will be defined in `src/state/` as per `docs/project-structure.md` (Version 0.3).
  - We will create modular stores based on specific concerns (e.g., `uiStore.ts` for general UI states like theme, `userSettingsStore.ts` for managing user preferences before they are persisted).
  - Avoid monolithic stores; prefer smaller, focused stores.
- **Component Interaction:**

  - **Accessing State:** Components will use the hook returned by `create` from Zustand to access state. Selectors will be used to subscribe to specific slices of state, ensuring components only re-render when relevant data changes.

    ```typescript
    // Example: src/state/uiStore.ts
    // import { create } from 'zustand';
    // interface UIState {
    //   theme: 'light' | 'dark' | 'system';
    //   setTheme: (theme: UIState['theme']) => void;
    // }
    // export const useUIStore = create<UIState>((set) => ({
    //   theme: 'system',
    //   setTheme: (theme) => set({ theme }),
    // }));

    // Example: src/features/some-feature/components/ThemeToggler.tsx
    // import { useUIStore } from '@/state/uiStore';
    // function ThemeToggler() {
    //   const theme = useUIStore((state) => state.theme);
    //   const setTheme = useUIStore((state) => state.setTheme);
    //   // ... render logic ...
    // }
    ```

  - **Updating State:** Actions (functions defined within the store that call `set`) will be used to update state. Components will call these actions.

- **Middleware:** Zustand middleware (e.g., `persist` for `localStorage` if needed for some UI preferences, or `devtools` for debugging with Redux DevTools) can be used as appropriate.

### 5.2. Dexie.js with `useLiveQuery` for Reactive Persistent Data

- **Purpose:** `dexie-react-hooks`, specifically the `useLiveQuery` hook, will be the primary mechanism for UI components to subscribe to and display data directly from IndexedDB (managed by Dexie.js) in a reactive manner. This ensures the UI always reflects the current state of persistent data, even if changes are made by Web Workers or other parts of the application.
- **Component Interaction:**

  - **Subscribing to Data:** Components will use `useLiveQuery` to execute Dexie.js queries. The hook automatically re-runs the query and re-renders the component when the underlying data tables affecting the query change.

    ```typescript
    // Example: src/features/exercises/components/ExerciseList.tsx
    // import { useLiveQuery } from 'dexie-react-hooks';
    // import { db } from '@/services/data/db'; // Dexie instance
    // function ExerciseList() {
    //   const exercises = useLiveQuery(
    //     () => db.exerciseDefinitions.orderBy('name').toArray(),
    //     [] // Dependencies for the query memoization
    //   );
    //
    //   if (!exercises) return <LoadingSpinner />; // Handle loading state
    //   // ... render list of exercises ...
    // }
    ```

  - **Loading & Error States:** `useLiveQuery` returns `undefined` while the query is initially running or if dependencies change and the query re-runs. Components must handle this loading state (e.g., by displaying a spinner). The query function passed to `useLiveQuery` can throw errors (e.g., if Dexie.js encounters an issue), which should be caught by React Error Boundaries higher up the component tree.
  - **Dependencies:** The second argument to `useLiveQuery` is a dependency array. It's crucial for memoizing the query function and ensuring it re-runs appropriately if query parameters change.

### 5.3. Local Component State (`useState`, `useReducer`)

- **Purpose:** For state that is truly local to a single component or a small, contained subtree of components, React's built-in `useState` and `useReducer` hooks should be used.
- **Guidelines:**
  - Use `useState` for simple local state (e.g., form input values before validation/submission, toggle states for UI elements like dropdowns).
  - Use `useReducer` for more complex local state logic within a component that involves multiple sub-values or intricate update logic that doesn't need to be global.
  - Avoid lifting local state to global Zustand stores unnecessarily if that state is not shared or persisted. This keeps global state cleaner and reduces potential re-renders.

### 5.4. Data Flow Patterns (UI Perspective)

- **Read Operations (Displaying Data):**
  1. **Persistent Data:** Component uses `useLiveQuery` -> Dexie.js queries IndexedDB -> Data reactively flows to the component for rendering.
  2. **Global UI/Transient State:** Component uses Zustand store hook with selector -> State flows to the component for rendering.
- **Write Operations (User Actions -> Data Modification):**
  1. **User Interaction** (e.g., submits a form, clicks a button).
  2. **UI Component Event Handler** is triggered.
  3. **Handler calls Application Logic** (this could be a function in a feature-specific service, a custom hook, or directly an action on a Zustand store if it's simple UI state).
  4. **Application Logic:**
     - May update **Zustand store(s)** for immediate UI feedback (e.g., setting a loading state).
     - May call **Comlink-wrapped Web Worker engine methods** (e.g., `frxWorker.evaluateProgression(...)`) for complex computations.
       - Worker performs its task, interacting with Dexie.js.
       - Worker updates Dexie.js.
       - `useLiveQuery` in relevant UI components automatically picks up Dexie.js changes and re-renders the UI.
       - Worker may return a result/status to the Application Logic via Comlink promise.
     - May directly call **Data Access Layer (Dexie.js)** for CRUD operations on persistent data.
       - Dexie.js updates IndexedDB.
       - `useLiveQuery` in UI components picks up changes and re-renders.
  5. **UI Re-renders:** Components re-render based on changes to Zustand state or data from `useLiveQuery`.

This hybrid approach ensures that components primarily concerned with displaying persistent data get it reactively and efficiently from Dexie.js via `useLiveQuery`, while Zustand handles more ephemeral global UI concerns and orchestrates actions that might involve calls to workers or direct Dexie.js modifications.

## 6. Forms Handling & Validation

Efficient and user-friendly forms are crucial for data input in StrongLog V1.0, from logging workout sets to defining custom exercises, programs, rules, and goals. This section outlines the strategy for managing form state, submissions, and validation.

### 6.1. Forms Handling Library

- **Recommendation:** **React Hook Form (`react-hook-form` latest stable version)**
- **Rationale:**
  - **Performance:** React Hook Form embraces uncontrolled components by default (though controlled is also supported), which can lead to better performance and fewer re-renders compared to some other form libraries that rely heavily on controlled components and frequent state updates. This is beneficial for a responsive PWA.
  - **Ease of Use & Integration:** It offers a simple, hooks-based API (`useForm`) that integrates seamlessly with React functional components.
  - **Reduced Boilerplate:** Generally requires less boilerplate code compared to libraries like Formik for similar functionality.
  - **Validation Support:** Provides excellent support for schema-based validation through integration with libraries like Zod (our chosen validation library), Yup, etc., as well as built-in validation rules.
  - **Developer Experience:** Features like isolated component re-renders, efficient form state updates, and good TypeScript support contribute to a positive developer experience.
  - **Accessibility:** Encourages building accessible forms by making it easy to integrate with standard HTML form elements and ARIA attributes.

### 6.2. Validation Strategy

- **Primary Validation Library:** **Zod** will be used for defining schemas and performing runtime validation of form data on the client-side.
- **Integration with React Hook Form:**

  - React Hook Form provides a `resolver` option that allows seamless integration with Zod schemas.
  - A Zod schema will be defined for each form's data structure. This schema will be passed to `useForm`'s `resolver` to automatically validate form fields against the defined rules.

    ```typescript
    // Example: Basic Zod schema for an exercise form
    // import { z } from 'zod';
    // export const exerciseFormSchema = z.object({
    //   name: z.string().min(1, "Exercise name is required."),
    //   equipment: z.string().optional(),
    //   // ... other fields
    // });

    // Example: Using it with useForm
    // import { useForm } from 'react-hook-form';
    // import { zodResolver } from '@hookform/resolvers/zod';
    // const { register, handleSubmit, formState: { errors } } = useForm({
    //   resolver: zodResolver(exerciseFormSchema),
    // });
    ```

- **Timing of Validation:** Validation will typically occur:
  - **On Blur:** When a user moves focus away from a field.
  - **On Change:** For some fields if immediate feedback is beneficial (can be configured).
  - **On Submit:** Before the form submission handler is executed.
- **User Feedback for Errors:**
  - Validation errors (derived from Zod via React Hook Form's `formState.errors`) will be displayed clearly next to the respective form fields.
  - UI components (e.g., from `shadcn/ui`) will be styled to indicate error states (e.g., red borders, error messages).
  - A summary of errors might be displayed if appropriate for complex forms.
    _(More details on general UI feedback are in Section 7: UI Feedback & Error Handling)._

### 6.3. Form Submission

- **Handler Functions:** The `handleSubmit` function provided by React Hook Form will be used to handle form submissions. It automatically prevents default browser submission and only calls the provided submit handler if validation (via Zod resolver) passes.
- **Asynchronous Operations:** Form submission handlers will often involve asynchronous operations, such as:
  - Saving data to IndexedDB via Dexie.js services.
  - Invoking methods on Web Worker engines (FRX, FRY, FRZ) via Comlink.
  - Sending data to the backend API for optional sync.
- **Loading/Disabled States:** During submission, form submit buttons will be disabled, and appropriate loading indicators will be displayed to provide user feedback.

### 6.4. Accessibility in Forms

- **Semantic HTML:** Use standard HTML form elements (`<form>`, `<input>`, `<label>`, `<button>`, `<select>`, `<textarea>`) correctly.
- **Labels:** Ensure all form inputs have associated, visible `<label>` elements, correctly linked using `htmlFor` and `id` attributes.
- **ARIA Attributes:** Use ARIA attributes (e.g., `aria-invalid`, `aria-describedby` for error messages) as needed to enhance accessibility, especially for custom form controls or complex validation feedback. `shadcn/ui` components (built on Radix UI) will provide a good baseline for this.
- **Keyboard Navigation:** Ensure all form elements are navigable and operable via keyboard.
- **Error Indication:** Errors should be programmatically associated with their respective inputs and clearly conveyed to users of assistive technologies.

By using React Hook Form with Zod for validation, we aim for a performant, maintainable, and user-friendly approach to forms handling throughout StrongLog V1.0.

## 7. UI Feedback & Error Handling

Providing clear, timely, and appropriate feedback to the user is essential for a good user experience. This includes indicating loading states, confirming successful operations, and gracefully handling errors.

### 7.1. Loading State Indication

- **Purpose:** To inform the user that an asynchronous operation is in progress and the application is working, preventing perceived freezes and user frustration.
- **Scenarios:**
  - Initial data fetching (e.g., when a view dependent on Dexie.js data first loads via `useLiveQuery`).
  - Form submissions involving asynchronous operations (saving to Dexie.js, calling workers, or sync API calls).
  - Operations involving Web Worker computations (e.g., FRX evaluation, FRY plan generation, FRZ progress calculation).
  - Optional data synchronization with the backend.
- **Patterns & Components:**
  - **Skeletons Screens/Components:** For initial page/view loads or when loading complex data sections, skeleton loaders (content placeholders that mimic the layout of the content being loaded) can be used to improve perceived performance. `shadcn/ui` provides a `Skeleton` component that can be utilized for this.
  - **Spinners/Loading Indicators:** For more localized or shorter operations (e.g., a button click triggering an async action), spinners or inline loading text can be used. `shadcn/ui` doesn't have a dedicated spinner, but common SVG-based spinners or simple text indicators ("Loading...") can be easily integrated or created.
  - **Button States:** Buttons triggering asynchronous actions should enter a disabled state and display a loading indicator (e.g., spinner within the button) during the operation to prevent multiple submissions and provide feedback.
  - **Global Loading Indicator (Optional):** For app-wide background sync operations, a subtle global loading indicator (e.g., a thin progress bar at the top of the screen) might be considered, managed via the `uiStore` (Zustand).
- **State Management:** Loading states will typically be managed by:
  - Local component state (`useState`) for component-specific operations.
  - Zustand stores for global or feature-wide loading states not directly tied to `useLiveQuery`.
  - `useLiveQuery` inherently handles its own loading state (returns `undefined` while data is being fetched initially).

### 7.2. Success & Informational Feedback

- **Purpose:** To confirm to the user that their actions were completed successfully or to provide non-critical information.
- **Patterns & Components:**
  - **Toasts/Snackbars:** For brief, non-intrusive success messages (e.g., "Workout saved successfully!", "Goal achieved!", "Settings updated.") or informational tips.
    - **Recommendation:** Utilize a library like **`react-hot-toast`** or **`sonner`** (which is often used with `shadcn/ui` aesthetics) for a clean, customizable, and accessible toast notification system. These can be styled to match the `shadcn/ui` look and feel.
  - **Inline Confirmations:** For some actions, a subtle inline confirmation (e.g., a checkmark appearing briefly) might be appropriate.
  - **Modal Dialogs (Infrequent for simple success):** For very significant successful operations that require more detailed confirmation, a modal (using `shadcn/ui` Dialog) could be used, but toasts are generally preferred for common success feedback.

### 7.3. UI Error Handling

- **Purpose:** To gracefully manage and communicate errors that occur within the UI or from underlying operations, preventing the application from crashing and guiding the user where possible.
- **React Error Boundaries:**
  - **Strategy:** Implement React Error Boundaries at appropriate levels in the component tree (e.g., around major layout sections, feature routes, or complex individual components).
  - **Function:** Error Boundaries are React components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI instead of the component tree that crashed.
  - **Fallback UI:** The fallback UI should be user-friendly, explaining that an error occurred and potentially offering options like trying again or returning to a safe page.
- **Handling Errors from Asynchronous Operations (Dexie.js, Workers, API Sync):**
  - **Propagation:** Errors from Dexie.js operations (wrapped in `try/catch`), Comlink worker calls (which return Promises that can reject), or optional sync API calls (`Workspace` or an HTTP client library) should be caught by the Application Logic or custom hooks making these calls.
  - **User Notification:**
    - **Critical Errors:** If an error prevents a core user action (e.g., failing to save a workout to IndexedDB), a clear, prominent message should be displayed, possibly using a modal dialog (`shadcn/ui` Dialog) or an alert (`shadcn/ui` Alert/AlertDialog), explaining the issue and suggesting potential next steps (e.g., "Failed to save workout due to insufficient storage. Please free up space and try again.").
    - **Non-Critical/Recoverable Errors:** For errors that are less critical or where the application can continue (e.g., a background sync attempt fails but offline mode is fine), a less intrusive toast notification (via `react-hot-toast` or `sonner`) can be used, possibly with a "retry" option.
  - **Logging:** All significant errors should be logged to the console (and to an external error tracking service if implemented for production) with sufficient context for debugging.
- **Form Validation Errors:** As discussed in "Forms Handling & Validation" (Section 6), Zod validation errors integrated with React Hook Form will be displayed inline next to the relevant fields.

### 7.4. Offline Status Indication

- **Purpose:** To subtly inform the user of their current network status and reassure them that the application is designed to work offline.
- **Patterns:**
  - **Initial Load:** If the app loads offline (served by the service worker), core functionality should be available seamlessly.
  - **Dynamic Indication (Optional for V1.0 unless critical):** A small, non-intrusive global UI indicator (e.g., an icon in the navbar or a subtle banner) could appear if the network connection is lost while the app is active. This can be managed using browser `navigator.onLine` events and potentially a Zustand store.
  - **Feedback during Sync Attempts:** If optional sync is enabled and an attempt fails due to being offline, a toast notification can inform the user that "Sync will resume when back online."
- **Core Principle:** The application should _feel_ like it always works. Explicit offline indicators should be used primarily to manage expectations around features that _do_ require connectivity (i.e., the optional sync).

By implementing these UI feedback and error handling strategies, we aim to create a user experience that is not only functional but also transparent, resilient, and reassuring for the user.

## 8. Interaction with Web Workers (from UI Components/Hooks)

StrongLog V1.0 offloads complex computations for its core engines (FRX, FRY, FRZ) to Shared Web Workers to maintain main thread responsiveness. This section outlines how the React UI components and custom hooks will interact with these Comlink-wrapped workers.

### 8.1. Invoking Worker Operations

- **Comlink Proxies:** The primary mechanism for interaction will be through Comlink proxies. As outlined in `docs/project-structure.md` (Version 0.3), a setup file (e.g., `src/services/engines/comlink.setup.ts`) will be responsible for creating and exporting Comlink-wrapped instances (proxies) of the engine APIs exposed by the Shared Web Workers.
- **Calling from Services/Hooks:** UI components will typically not call worker methods directly. Instead, this interaction will be abstracted away by:
  - **Custom Hooks:** For UI-related asynchronous logic that depends on an engine (e.g., `useProgramWorkoutPlanner` hook might call the FRY engine).
  - **Application Logic / Services:** Feature-specific services or global application logic modules (in `src/features/[featureName]/services/` or `src/services/`) will encapsulate the calls to the worker proxies.
  - **Example Flow:** 1. A React component (e.g., `NextWorkoutButton`) calls a function from a custom hook or an application service (e.g., `programService.generateNextWorkoutPlan(programId)`). 2. This service function then calls the appropriate method on the Comlink-wrapped FRY engine proxy (e.g., `await fryEngineProxy.determineNextWorkoutPlan(programId)`).
- **Asynchronous Nature:** All calls to worker methods via Comlink will be asynchronous and will return Promises. This means `async/await` will be used extensively in the calling hooks or services.

### 8.2. Managing Asynchronous Responses & State Updates

- **Handling Promises:** The calling code (custom hooks or services) will `await` the Promises returned by Comlink proxy methods.
- **Updating State:**

  - **Results influencing UI directly:** If the result from a worker directly impacts what the UI should display (and isn't already handled by `useLiveQuery` reacting to Dexie.js changes made by the worker), the custom hook or service will update the relevant Zustand store or use `setState` from a `useState` hook if the state is local to a component or its consuming hook.
  - **Loading States:** The calling hook/service will manage loading states (e.g., `isLoadingFRYPlan`) and expose them to the UI components. These states will be set to `true` before the Comlink call and `false` once the Promise resolves or rejects. This integrates with the UI feedback mechanisms discussed in Section 7.1.
  - **Error States:** Errors from worker operations (rejected Promises from Comlink) will be caught in the `try/catch` block of the calling hook/service. These errors will be processed, potentially updating an error state (local or global via Zustand) for UI display, and logged as per Section 7.3 and `docs/coding-standards.md`.

    ```typescript
    // Example: Conceptual custom hook interacting with a worker via a service
    // function useNextWorkoutPlanner(programId: string) {
    //   const [isLoading, setIsLoading] = useState(false);
    //   const [error, setError] = useState<Error | null>(null);
    //   const [nextWorkoutPlan, setNextWorkoutPlan] = useState<WorkoutPlan | null>(null);
    //   const { someZustandAction } = useSomeZustandStore();

    //   const fetchNextPlan = useCallback(async () => {
    //     setIsLoading(true);
    //     setError(null);
    //     try {
    //       // fryEngineService would use the Comlink proxy
    //       const plan = await fryEngineService.generatePlan(programId);
    //       setNextWorkoutPlan(plan);
    //       // Or, if plan updates Dexie & useLiveQuery handles UI:
    //       // await fryEngineService.triggerPlanGenerationAndUpdateDB(programId);
    //       // someZustandAction(plan.summary); // Example of updating Zustand
    //     } catch (err) {
    //       setError(err as Error);
    //       console.error("Error generating next workout plan:", err);
    //     } finally {
    //       setIsLoading(false);
    //     }
    //   }, [programId, someZustandAction]);

    //   return { isLoading, error, nextWorkoutPlan, fetchNextPlan };
    // }
    ```

### 8.3. Data Flow Recap for Worker Interactions

The primary data flow involving workers, especially for read-heavy operations or operations that modify persistent state, will often be:

1. **UI Event / Component Mount:** Triggers a custom hook or application service.
2. **Service/Hook Call:** Invokes a method on a Comlink-wrapped Shared Worker engine.
3. **Worker Execution:** The engine in the worker:
   - Performs its computations.
   - Reads data from Dexie.js.
   - **Writes any resulting changes directly back to Dexie.js.**
4. **Reactive UI Update:** UI Components subscribed to the relevant Dexie.js data via `useLiveQuery` automatically re-render to reflect the changes made by the worker.
5. **Optional Direct Result:** The worker may also return a direct result (e.g., a status, a calculated value not persisted, or a summary) via the Comlink Promise. This result can then be used to update Zustand stores or local component state if needed for UI elements not directly driven by `useLiveQuery`.

This pattern leverages Dexie.js as the primary source of truth for persistent data and `useLiveQuery` for UI reactivity, while Comlink and workers handle the heavy lifting and direct data manipulation asynchronously.

### 8.4. Worker Lifecycle Management

- As detailed in the research, the Comlink proxies and underlying Shared Worker connections will need careful lifecycle management. If specific UI sections are solely responsible for interacting with a worker for a period, they might use `useEffect` to establish communication when mounted and clean up (e.g., release Comlink proxy if reference counting is implemented for the Shared Worker connections, though Shared Workers themselves persist as long as one connection is open) when unmounted.
- However, given the FRX, FRY, and FRZ engines are core, their Comlink proxies might be initialized at a higher level in the application (e.g., when the app loads or when a user logs in for sync) and made available via services or React Context if direct access from multiple hooks/components is needed (though service-level abstraction is preferred).

This approach ensures that UI components remain focused on presentation and user interaction, while the complexities of asynchronous communication and computation with Web Workers are encapsulated within dedicated hooks or services.

## 9. PWA-Specific UI Considerations

As a Progressive Web Application (PWA), StrongLog V1.0 has specific UI/UX considerations to ensure a seamless, app-like experience, particularly regarding installability, updates, and offline behavior.

### 9.1. PWA Installation Prompts

- **Goal:** To encourage users on supported platforms to install StrongLog to their home screen for easy access and a more integrated experience.
- **Strategy:**
  - **Browser-Provided Prompts:** Most modern browsers on compatible platforms will automatically show an install prompt (e.g., "Add to Home Screen" banner or an icon in the address bar) when the PWA meets the installability criteria (HTTPS, service worker, valid web app manifest). We will ensure these criteria are met.
  - **Custom In-App Install Button/UI (Recommended):**
    - To provide a more controlled and contextually relevant installation experience, we will implement a custom "Install App" button or UI element within the application (e.g., in settings, or as a dismissible banner after a few successful sessions).
    - This UI will listen for the `beforeinstallprompt` event. If the event fires (meaning the browser is ready to prompt but hasn't yet), we will save the event object and show our custom button.
    - Clicking our custom button will then trigger the saved prompt (`deferredPrompt.prompt()`).
    - This approach gives us control over when and how the install option is presented to the user, potentially improving conversion.
- **User Feedback:** After a successful installation, provide a confirmation message. If the user dismisses the prompt, respect their choice and potentially offer the option again later after a reasonable interval or if they revisit a specific "how to install" section.

### 9.2. Application Update Notifications & UI

- **Goal:** To inform users when a new version of the PWA has been downloaded by the service worker and is ready to be activated, ensuring they can easily switch to the latest version.
- **Strategy (via Service Worker & `vite-plugin-pwa`):**
  - The `vite-plugin-pwa` (using Workbox) will be configured to handle background updates of the service worker when new application versions are deployed.
  - When a new service worker has been installed and is waiting to activate (i.e., `SW_UPDATED` event or similar, depending on the `vite-plugin-pwa` configuration), the application will display a non-intrusive notification or UI element to the user.
  - **UI Pattern:** This could be a dismissible "toast" notification (using `react-hot-toast` or `sonner`) or a banner stating "A new version of StrongLog is available. Refresh to update?"
  - **Action:** The notification should include an "Update" or "Refresh" button. Clicking this button will trigger the necessary service worker command to activate the new version (e.g., `skipWaiting()` followed by a page reload).
- **User Experience:** The update process should be as seamless as possible, ideally with minimal disruption to the user's current task if they choose to defer the update.

### 9.3. Offline Experience and UI Indication

- **Core Principle:** StrongLog V1.0 is designed to be fully functional offline for all core features. The UI should reflect this capability and build user confidence.
- **UI During Offline Operation:**
  - **Seamless Functionality:** Most of the application (logging, viewing history from Dexie.js, using FRX/FRY/FRZ with local data) should operate without any change in behavior when offline.
  - **Optional Sync Feature Indication:**
    - If the optional data synchronization feature is enabled by the user, and the application detects it is offline (e.g., via `navigator.onLine` or failed API calls), UI elements related to sync status should clearly indicate this (e.g., "Offline - Sync paused," "Sync will resume when online"). This could be a subtle global indicator or a message within the sync settings area.
    - Any user actions that would normally trigger a sync (e.g., saving a new workout) will still save locally to Dexie.js. The sync service will queue these changes for when connectivity is restored.
- **Data Persistence:** Reassure users (perhaps through onboarding or help sections) that their data is being saved locally to their device even when offline.

### 9.4. Responsive Design for PWA Form Factors

- **Mobile-First Implementation:** As stated in the Core Frontend Principles (Section 2.1), all UI will be designed and implemented with a mobile-first approach.
- **Tailwind CSS Breakpoints:** Utilize Tailwind CSS's responsive breakpoints (`sm`, `md`, `lg`, `xl`, etc.) to adapt layouts, typography, and component visibility for different screen sizes, ensuring optimal usability on phones, tablets, and potentially desktop PWA usage.
- **Touch-Optimized Interactions:**
  - Ensure interactive elements (buttons, form inputs, draggable items if any) have sufficiently large tap targets for touchscreens.
  - Test and optimize for common touch gestures.
  - Consider mobile-specific interaction patterns where appropriate.
- **Viewport Configuration:** The `index.html` will include the appropriate viewport meta tag to control layout on mobile browsers: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.

By addressing these PWA-specific UI considerations, StrongLog V1.0 will offer a more polished, integrated, and reliable user experience that aligns with user expectations for modern web applications.
