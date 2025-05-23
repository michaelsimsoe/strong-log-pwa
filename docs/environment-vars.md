# StrongLog V1.0 Environment Variables

**Version:** 0.1
**Date:** 2025-05-22
**Author:** 3 Arkitekten (AI)

This document details the environment variables used by the StrongLog V1.0 Progressive Web Application.

## 1\. Configuration Loading Mechanism

* **Local Development:**
  * Environment variables for local development will be managed using `.env` files at the project root (e.g., `.env`, `.env.local`, `.env.development`, `.env.development.local`).
  * Vite automatically loads these files based on the current mode (`development`, `production`). Variables must be prefixed with `VITE_` to be exposed to the client-side bundle (e.g., `VITE_API_BASE_URL`).
* **Build Time / Deployment (e.g., Staging, Production):**
  * During the CI/CD build process (e.g., via GitHub Actions), environment-specific variables will be injected into the build process.
  * Hosting platforms (like Netlify, Vercel, or custom cloud setups) typically provide a way to set environment variables for different build environments (staging, production). These will be picked up by Vite during the build.
  * Only variables prefixed with `VITE_` will be embedded in the client-side code.

## 2\. Required & Optional Variables

The following table lists environment variables used by the StrongLog PWA.

| Variable Name          | Description                                                                    | Example / Default Value                      | Required for Build? (Yes/No) | Sensitive? (Yes/No) | Notes                                                                                                   |
| :--------------------- | :----------------------------------------------------------------------------- | :------------------------------------------- | :--------------------------- | :------------------ | :------------------------------------------------------------------------------------------------------ |
| `VITE_APP_NAME`        | The display name of the application.                                           | `StrongLog`                                  | Yes                          | No                  | Used for display purposes within the app, or potentially in titles/metadata.                              |
| `VITE_APP_VERSION`     | The current version of the application.                                        | (Typically injected from `package.json` version at build time) | Yes                          | No                  | Can be displayed in an "About" section or used for debugging/logging.                                   |
| `VITE_API_BASE_URL`    | The base URL for the optional backend synchronization API. | `https://api.stronglog.example.com/api/v1` (Prod) \<br/\> `http://localhost:3001/api/v1` (Dev) | Yes (if sync feature is built) | No                  | Crucial for the optional data sync feature. Must be configured per environment (dev, staging, prod).    |
| `VITE_DEFAULT_LOCALE`  | Default locale for internationalization (i18n), if implemented.                | `en`                                         | No (unless i18n is core)     | No                  | Placeholder if i18n becomes a feature.                                                                  |
| `VITE_SENTRY_DSN`      | Data Source Name (DSN) for Sentry error tracking service.                      | `https://your-public-key@sentry.io/project-id` | No                           | No (but public key) | To be used if Sentry (or similar error tracking) is implemented for production error monitoring.      |
| `VITE_FEATURE_FLAG_XYZ`| Example of a feature flag to enable/disable specific experimental features.    | `true` / `false`                             | No                           | No                  | Allows for phased rollout or A/B testing of new functionalities. Specific flags TBD as needed.        |
| `NODE_ENV`             | Build mode (automatically set by Vite).                                        | `development` / `production`                 | N/A (Set by Vite)            | No                  | Used internally by Vite and libraries to enable/disable dev-only features or optimizations.         |

## 3\. Notes

* **Secrets Management (Client-Side):**
  * True secrets (like private API keys for third-party services that the *client itself* would call directly and need to be kept hidden from users) **should not** be embedded in a client-side PWA bundle, even via environment variables, as they would be exposed.
  * For StrongLog, the `VITE_API_BASE_URL` is not a secret. Authentication with this API will be handled via user-specific tokens obtained after login, not via a globally embedded API key for the PWA itself.
  * If any build-time process requires a secret API key (e.g., to fetch some data at build time), that key would be configured in the CI/CD environment and not exposed to the client bundle.
* **`.env.example` File:**
  * An `.env.example` file should be committed to the repository. This file will list all required and optional `VITE_` prefixed environment variables with placeholder or example values (but no actual secrets).
  * Developers will copy this to their own `.env.local` (which is git-ignored) and populate it with their local development values.
* **Validation:**
  * While Vite embeds these variables, it's good practice for the application code to validate the presence or format of critical environment variables at startup where appropriate (e.g., ensuring `VITE_API_BASE_URL` is a valid URL if the sync feature is active). Zod could be used for this in a configuration loading module.

## Change Log

| Change        | Date         | Version | Description                                      | Author            |
|---------------|--------------|---------|--------------------------------------------------|-------------------|
| Initial draft | 2025-05-22   | 0.1     | Initial draft of environment variables document. | 3 Arkitekten (AI) |
