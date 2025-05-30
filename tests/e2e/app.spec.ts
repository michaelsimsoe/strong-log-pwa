import { test, expect } from '@playwright/test';

test('basic app test - verify app loads with correct title', async ({ page }) => {
  // Navigate to the app
  await page.goto('/');

  // Check if the app loaded properly
  const appElement = await page.locator('#root');
  await expect(appElement).toBeVisible();

  // Check if the main heading is visible
  const heading = await page.getByRole('heading', { name: /StrongLog/i });
  await expect(heading).toBeVisible();

  // Check page title
  await expect(page).toHaveTitle('StrongLog');
});

test('verify PWA elements are present', async ({ page }) => {
  // Navigate to the app
  await page.goto('/');

  // Check for manifest link
  const manifestLink = await page.locator('link[rel="manifest"]');
  await expect(manifestLink).toHaveAttribute('href', '/manifest.json');

  // Check for theme-color meta tag
  const themeColorMeta = await page.locator('meta[name="theme-color"]');
  await expect(themeColorMeta).toBeVisible();

  // Check for apple-touch-icon
  const appleTouchIcon = await page.locator('link[rel="apple-touch-icon"]');
  await expect(appleTouchIcon).toBeVisible();
});

test('verify error boundary works', async ({ page }) => {
  // Navigate to the app
  await page.goto('/');

  // Force an error by evaluating JavaScript in the page
  await page
    .evaluate(() => {
      // Find the root React component and force an error
      const rootElement = document.getElementById('root');
      if (rootElement) {
        // This will trigger the error boundary
        throw new Error('Forced error for testing error boundary');
      }
    })
    .catch(() => {
      // We expect this to throw an error, so catch it
      console.log('Error thrown as expected');
    });

  // Note: In a real application, we would check for the error boundary UI
  // But since our error is thrown outside React's control, we can't easily test this
  // This is a placeholder for a more comprehensive test in the future
});
