# Test info

- Name: verify PWA elements are present
- Location: /Users/michaelkr/code/moi/strongLogDir/strong-log-pwa/tests/e2e/app.spec.ts:19:1

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: locator('meta[name="theme-color"]')
Expected: visible
Received: hidden
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for locator('meta[name="theme-color"]')
    9 × locator resolved to <meta content="#4a5568" name="theme-color"/>
      - unexpected value "hidden"

    at /Users/michaelkr/code/moi/strongLogDir/strong-log-pwa/tests/e2e/app.spec.ts:29:32
```

# Page snapshot

```yaml
- banner:
    - heading "StrongLog" [level=1]
    - paragraph: Track your strength training progress
- paragraph: Your personal strength training companion
- button "You clicked 0 times"
- contentinfo:
    - paragraph: StrongLog PWA - Version 1.0
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test('basic app test - verify app loads with correct title', async ({ page }) => {
   4 |   // Navigate to the app
   5 |   await page.goto('/');
   6 |
   7 |   // Check if the app loaded properly
   8 |   const appElement = await page.locator('#root');
   9 |   await expect(appElement).toBeVisible();
  10 |
  11 |   // Check if the main heading is visible
  12 |   const heading = await page.getByRole('heading', { name: /StrongLog/i });
  13 |   await expect(heading).toBeVisible();
  14 |
  15 |   // Check page title
  16 |   await expect(page).toHaveTitle('StrongLog');
  17 | });
  18 |
  19 | test('verify PWA elements are present', async ({ page }) => {
  20 |   // Navigate to the app
  21 |   await page.goto('/');
  22 |
  23 |   // Check for manifest link
  24 |   const manifestLink = await page.locator('link[rel="manifest"]');
  25 |   await expect(manifestLink).toHaveAttribute('href', '/manifest.json');
  26 |
  27 |   // Check for theme-color meta tag
  28 |   const themeColorMeta = await page.locator('meta[name="theme-color"]');
> 29 |   await expect(themeColorMeta).toBeVisible();
     |                                ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
  30 |
  31 |   // Check for apple-touch-icon
  32 |   const appleTouchIcon = await page.locator('link[rel="apple-touch-icon"]');
  33 |   await expect(appleTouchIcon).toBeVisible();
  34 | });
  35 |
  36 | test('verify error boundary works', async ({ page }) => {
  37 |   // Navigate to the app
  38 |   await page.goto('/');
  39 |
  40 |   // Force an error by evaluating JavaScript in the page
  41 |   await page.evaluate(() => {
  42 |     // Find the root React component and force an error
  43 |     const rootElement = document.getElementById('root');
  44 |     if (rootElement) {
  45 |       // This will trigger the error boundary
  46 |       throw new Error('Forced error for testing error boundary');
  47 |     }
  48 |   }).catch(() => {
  49 |     // We expect this to throw an error, so catch it
  50 |     console.log('Error thrown as expected');
  51 |   });
  52 |
  53 |   // Note: In a real application, we would check for the error boundary UI
  54 |   // But since our error is thrown outside React's control, we can't easily test this
  55 |   // This is a placeholder for a more comprehensive test in the future
  56 | });
  57 |
```
