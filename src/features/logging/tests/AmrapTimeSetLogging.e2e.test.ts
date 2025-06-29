import { test, expect } from '@playwright/test';

test('User can log an AMRAP Time set', async ({ page }) => {
  // Navigate to the workout logging page
  await page.goto('/workout/new');
  await expect(page).toHaveTitle(/Strong Log/);

  // Wait for page to fully load
  await page.waitForSelector('text=New Workout');

  // Add an exercise
  await page.click('button:has-text("Add Exercise")');
  await page.waitForSelector('text=Select Exercise');

  // Search for an exercise
  await page.fill('input[placeholder="Search exercises..."]', 'Bench Press');
  await page.click('text=Bench Press');

  // Verify exercise was added
  await expect(page.locator('text=Bench Press')).toBeVisible();

  // Add a set
  await page.click('button:has-text("Add Set")');

  // Change set type to AMRAP Time
  await page.click('button[aria-label="Select set type"]');
  await page.click('text=AMRAP for Time');

  // Set weight and target duration
  await page.fill('input[aria-label="Weight for set 1"]', '100');
  await page.fill('input[aria-label="Target duration for set 1"]', '60');

  // Start the timer
  await page.click('button:has-text("Start Timer")');

  // Wait for timer to appear
  await page.waitForSelector('text=Countdown');

  // For E2E testing, we'll simulate timer completion by clicking the Complete button
  // In a real scenario, we'd wait for the timer to finish
  await page.click('button:has-text("Complete")');

  // Enter reps achieved
  await page.fill('input[aria-label="Reps for set 1"]', '15');

  // Mark set as completed
  await page.click('input[type="checkbox"]');

  // Complete the workout
  await page.click('button:has-text("Complete Workout")');

  // Verify workout was saved
  await page.waitForSelector('text=Workout completed');

  // Navigate to workout history to verify the workout was saved
  await page.goto('/workouts');

  // Verify the workout appears in history
  await expect(page.locator('text=Bench Press')).toBeVisible();

  // Click on the workout to view details
  await page.click('text=Bench Press');

  // Verify AMRAP Time set details are displayed
  await expect(page.locator('text=AMRAP: Max Reps in 60 seconds')).toBeVisible();
  await expect(page.locator('text=15 reps')).toBeVisible();
  await expect(page.locator('text=100 kg')).toBeVisible();
});
