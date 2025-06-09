# StrongLog V1.0 UI/UX Specification

## 1. Introduction

This document defines the user experience goals, high-level information architecture, general user flow considerations, visual design guidelines, and core UI principles for the StrongLog V1.0 Progressive Web Application (PWA). Its purpose is to serve as a central reference for maintaining a consistent, intuitive, accessible, and efficient user interface across the application.

Detailed UI specifications, element breakdowns, and interaction flows specific to individual user stories will be documented in corresponding files under `ai/ui-stories/epicN.storyN.story.md`.

- **Link to Primary Design Files:** Initial mockups provided (e.g., `image_3e941f.jpg`, `image_3e90df.png`). Further detailed designs (e.g., Figma link) TBD.
- **Link to Deployed Storybook / Design System:** TBD (Potentially, if a dedicated Storybook is set up for `shadcn/ui` customizations and any custom global components).

## 2. Overall UX Goals & Principles

- **Target User Personas:** Data-driven powerlifters and structured strength enthusiasts who value offline capabilities, comprehensive user-controlled analytics, and data privacy. Users may be migrating from other apps like StrongLifts.
- **Usability Goals:**
  - **Effortless Logging:** Workout logging, including advanced set types, must be extremely efficient and intuitive.
  - **Ease of Learning:** The application should be straightforward to learn, especially for core functionalities.
  - **Efficiency of Use:** Common tasks should be achievable with minimal clicks and cognitive load.
  - **Error Prevention & Recovery:** The UI should guide users to prevent errors and provide clear, simple recovery paths when errors occur. This includes clear presentation of validation errors.
  - **Offline First:** All V1.0 features must be fully functional offline, ensuring a reliable user experience. The app shell and essential assets will be cached for fast offline launch.
- **Design Principles:**
  - **Clarity and Simplicity:** Prioritize clear, uncluttered interfaces and straightforward interactions.
  - **User Control & Transparency:** Users must always feel in control, with clear visibility into system actions (e.g., progression engine suggestions) and the ability to override them.
  - **Consistency:** Maintain a consistent visual language, interaction patterns, and terminology throughout the application.
  - **Feedback:** Provide immediate and unambiguous feedback for user actions and system status changes. Interactive elements should have clear states (hover, active, disabled).
  - **Accessibility:** Design for inclusivity from the outset, aiming for WCAG 2.1 Level AA compliance where feasible.

## 3. Information Architecture (IA)

### High-Level Screen Inventory / Main Application Areas

The application will be structured around several key areas, accessible through primary navigation. These include, but are not limited to:

- **Application Shell / Main Layout:** The overall framing structure, including persistent navigation and content hosting area.
- **Dashboard / Home:** The primary landing screen, providing an overview, "Today's Focus," and quick actions.
- **Workout Logging:** Area for starting, performing, and saving workout sessions.
- **Exercise Library / Management:** Section for Browse, creating, and managing custom and pre-populated exercises.
- **Programs:** Area for defining, managing, and following training programs.
- **Progression Rules:** Section for defining and managing user-controlled progression logic.
- **Goals:** Area for setting and tracking user-defined training goals.
- **History / Analytics ("Story"):** View for past workout logs and performance analytics.
- **Settings:** Screen for user preferences, account management (optional sync), and data management.

_(Detailed screen elements and states for each story will be in `ai/ui-stories/`.)_

### Primary Navigation Model

- A **persistent bottom tab bar** is the proposed primary navigation method for this mobile-first PWA, providing quick access to the main application areas.
- Initial tabs identified from mockups: HOME, WORKOUTS, STORY (History/Analytics), SETTINGS. This structure should be evaluated for scalability as features are added.
- Secondary navigation (e.g., back buttons, contextual actions within headers) will be used for navigating within sections.

## 4. User Flows

Detailed user flows and micro-interactions specific to features within individual stories will be documented in the respective `ai/ui-stories/epicN.storyN.story.md` files, often using Mermaid diagrams.

Overarching application flows (e.g., the complete anonymous user journey from first launch to consistent use, or the journey of a user engaging with programs and progressions over time) may be conceptualized here or linked as separate documents if extensive.

**General Flow Principles:**

- Minimize steps to complete core tasks (especially workout logging).
- Provide clear pathways and calls to action.
- Ensure smooth transitions between related features.
- Gracefully handle interruptions and state restoration (e.g., during offline/online transitions).

## 5. Component Library / Design System Reference

The UI will be built using **React** with components primarily sourced from **`shadcn/ui`**, styled using **Tailwind CSS**. This approach provides a foundation of accessible, customizable components and utility-first styling.

**General Component Guidelines:**

- **Source:** Prioritize using or adapting `shadcn/ui` components. Custom components should only be created when `shadcn/ui` does not offer a suitable primitive or pattern.
- **Styling:** Tailwind CSS will be used for all styling. Adherence to the defined theme (colors, fonts, spacing) is critical.
- **Accessibility:** Components must adhere to accessibility best practices (keyboard navigation, ARIA roles/attributes, focus management). `shadcn/ui` components generally provide a strong accessible base.
- **States:** All interactive components must have clear visual states: default, hover, focus, active, disabled, loading (if applicable).
- **Reusability:** Design components with reusability in mind. Story-specific component variants will be detailed in `ai/ui-stories/`.

**Common Component Categories (examples, details in `shadcn/ui` documentation and `ui-story` files):**

- Layout (Page Wrappers, Headers, Main Content Areas)
- Navigation (Bottom Tab Bar, Buttons, Links)
- Forms & Inputs (Text Inputs, Number Inputs, Selects, RadioGroups, Checkboxes, Labels)
- Data Display (Lists, Cards, Tables, Tags)
- Modals & Dialogs (Confirmation Dialogs, Information Modals, Drawers/Sheets for mobile)
- Feedback Elements (Error Messages, Toasts/Snackbars, Loading Indicators)

_(Specific `shadcn/ui` components to be used and any custom component specifications for particular features will be detailed in the relevant `ai/ui-stories/` files.)_

## 6. Branding & Style Guide Reference

This section outlines the general visual identity for StrongLog. Specific applications will be detailed in mockups and `ui-story` files.

- **Color Palette:**
  - Primary: Shades of Purple (observed in initial mockups like `image_3e941f.jpg`). Specific hex codes to be finalized.
  - Secondary/Accent: Complementary colors for calls to action, highlights, and state indication (e.g., greens, blues as seen in `image_3e90df.png`). Specific hex codes to be finalized.
  - Neutrals: Whites, and a range of Grays for backgrounds, text, borders, and disabled states.
  - Themes: The application will support **Light, Dark, and System** themes. Theme definitions will be managed via Tailwind CSS configuration.
  - Contrast: All color combinations for text and meaningful UI elements must meet WCAG 2.1 AA contrast ratios.
- **Typography:**
  - Font Families: A primary sans-serif font family will be chosen for clarity and modern appeal (as observed in mockups). Specific font(s) TBD and configured in Tailwind CSS theme.
  - Scale: A typographic scale (sizes, weights, line heights) will be defined for headings (H1-H6), body text, labels, captions, etc., to ensure visual hierarchy and readability.
  - Accessibility: Font choices and typographic scales must support readability and accessibility. `shadcn/ui` components leverage Radix UI primitives, which aid in this.
- **Iconography:**
  - Style: Clean, clear, and consistent icon style (e.g., filled or outline, as seen in mockups).
  - Set: A specific icon set will be chosen (e.g., Lucide Icons, which are default for `shadcn/ui`, or Heroicons).
  - Usage: Icons should be used purposefully to enhance comprehension and visual appeal, with appropriate accessibility considerations (e.g., `aria-label` for icon-only buttons).
- **Spacing & Grid:**
  - A consistent spacing scale (e.g., 4px or 8px base unit) will be defined and applied through Tailwind CSS utility classes for margins, paddings, and layout composition.
  - Layouts will primarily use Tailwind's flexbox and grid utilities.
- **Visual Style:**
  - Overall: Modern, clean, and focused.
  - Elements: Rounded corners for containers like cards and main content panes are a feature of the initial visual direction.
  - Imagery/Patterns: Subtle background patterns or subtle illustrative elements are acceptable if they enhance aesthetics without compromising usability or performance.

## 7. Accessibility (AX) General Requirements

StrongLog V1.0 aims for WCAG 2.1 Level AA compliance where feasible. Accessibility is a core consideration throughout the design and development process.

**General Principles & Requirements:**

- **Perceivable:**
  - Provide text alternatives for non-text content (e.g., icons, images if not purely decorative).
  - Ensure sufficient color contrast.
  - Content should be resizable without loss of information or functionality.
- **Operable:**
  - All functionality must be keyboard accessible.
  - Provide clear focus indicators for all interactive elements.
  - Avoid content that causes seizures (no rapidly flashing animations).
  - Provide users enough time to read and use content.
- **Understandable:**
  - Make text content readable and understandable.
  - Make web pages appear and operate in predictable ways.
  - Help users avoid and correct mistakes (clear error messages, intuitive validation).
- **Robust:**
  - Maximize compatibility with current and future user agents, including assistive technologies. This is supported by using semantic HTML and well-vetted component libraries like `shadcn/ui`.

_(Specific accessibility considerations for components and features will be detailed in `ai/ui-stories/` files.)_

## 8. Responsiveness General Strategy

The StrongLog PWA is designed as a mobile-first application.

**General Principles & Requirements:**

- **Mobile-First:** Design and optimize for smaller screens and touch interactions initially.
- **Progressive Enhancement:** Ensure usability on larger screens (tablets, desktops accessed via browser) by adapting layouts.
- **Breakpoints:** Utilize standard Tailwind CSS breakpoints (sm, md, lg, xl) as a baseline. Custom breakpoints can be added if necessary.
- **Fluid Layouts:** Employ fluid grids and flexible images/media.
- **Touch Targets:** Ensure interactive elements have adequate touch target sizes on mobile devices.
- **Readability:** Maintain text readability across all screen sizes.

_(Specific responsive behaviors for layouts and components will be detailed in `ai/ui-stories/` files where complex adaptations are needed.)_

## 9. Change Log

| Change         | Date       | Version | Description                                                                    | Author      |
| -------------- | ---------- | ------- | ------------------------------------------------------------------------------ | ----------- |
| Initial draft  | 2025-05-30 | 0.1     | Created based on PRD, Arch, Epics & PO Notes                                   | 6 UX/UI Gem |
| Epic 1 Detail  | 2025-05-30 | 0.2     | Consolidated Epic 1 details from mockups and story files (.md) into spec.      | 6 UX/UI Gem |
| Generalization | 2025-05-30 | 0.3     | Revised to be a more general spec; story-specific details moved to ui-stories. | 6 UX/UI Gem |
