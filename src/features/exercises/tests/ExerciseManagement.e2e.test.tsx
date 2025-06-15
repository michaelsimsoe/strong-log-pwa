import { test, expect } from '@playwright/test';

test.describe('Exercise Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the exercise list page
    await page.goto('/exercises');

    // Wait for the page to load
    await page.waitForSelector('h1:has-text("Exercise Library")');

    // Clear any existing custom exercises for clean testing
    // This uses the browser's IndexedDB API to clear data
    await page.evaluate(() => {
      return new Promise(resolve => {
        const request = indexedDB.open('StrongLogDatabase');
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction('exerciseDefinitions', 'readwrite');
          const store = tx.objectStore('exerciseDefinitions');

          // Only delete custom exercises (isCustom = true)
          const index = store.index('isCustom');
          const range = IDBKeyRange.only(true);
          const cursorRequest = index.openCursor(range);

          cursorRequest.onsuccess = (e: Event) => {
            const cursor = (e.target as IDBRequest<IDBCursorWithValue | null>).result;
            if (cursor) {
              cursor.delete();
              cursor.continue();
            }
          };

          tx.oncomplete = () => {
            db.close();
            resolve(true);
          };
        };
      });
    });

    // Reload the page to reflect the cleared data
    await page.reload();
  });

  test('should create, edit, and delete a custom exercise', async ({ page }) => {
    // Click the Create Exercise button
    await page.click('button:has-text("Create Exercise")');

    // Wait for the create page to load
    await page.waitForSelector('h1:has-text("Create Exercise")');

    // Fill out the form
    await page.fill('input[name="name"]', 'E2E Test Exercise');
    await page.click('button[role="combobox"]');
    await page.click('div[role="option"]:has-text("Dumbbell")');
    await page.fill('input[name="primaryMuscleGroups"]', 'Shoulders, Triceps');
    await page.click('input[value="kg"]');
    await page.fill('textarea[name="notes"]', 'This is a test exercise created by E2E test');

    // Submit the form
    await page.click('button:has-text("Create Exercise")');

    // Wait for redirect back to exercise list
    await page.waitForSelector('h1:has-text("Exercise Library")');

    // Verify the new exercise appears in the list
    await expect(page.locator('text=E2E Test Exercise')).toBeVisible();
    await expect(page.locator('text=Dumbbell')).toBeVisible();
    await expect(page.locator('text=• Shoulders, Triceps')).toBeVisible();

    // Click edit button for the exercise
    await page.click('button[aria-label="Edit E2E Test Exercise"]');

    // Wait for the edit page to load
    await page.waitForSelector('h1:has-text("Edit Exercise")');

    // Update the exercise name
    await page.fill('input[name="name"]', 'Updated E2E Exercise');

    // Submit the form
    await page.click('button:has-text("Update Exercise")');

    // Wait for redirect back to exercise list
    await page.waitForSelector('h1:has-text("Exercise Library")');

    // Verify the updated exercise name appears
    await expect(page.locator('text=Updated E2E Exercise')).toBeVisible();

    // Click delete button for the exercise
    await page.click('button[aria-label="Delete Updated E2E Exercise"]');

    // Wait for the confirmation dialog
    await page.waitForSelector('div[role="alertdialog"]');

    // Confirm deletion
    await page.click('button:has-text("Delete")');

    // Verify the exercise is removed
    await expect(page.locator('text=Updated E2E Exercise')).not.toBeVisible();
  });

  test('should search for exercises', async ({ page }) => {
    // First create a couple of exercises
    // Create first exercise
    await page.click('button:has-text("Create Exercise")');
    await page.waitForSelector('h1:has-text("Create Exercise")');
    await page.fill('input[name="name"]', 'Barbell Bench Press');
    await page.click('button:has-text("Create Exercise")');
    await page.waitForSelector('h1:has-text("Exercise Library")');

    // Create second exercise
    await page.click('button:has-text("Create Exercise")');
    await page.waitForSelector('h1:has-text("Create Exercise")');
    await page.fill('input[name="name"]', 'Squat');
    await page.click('button:has-text("Create Exercise")');
    await page.waitForSelector('h1:has-text("Exercise Library")');

    // Search for 'bench'
    await page.fill('input[placeholder="Search exercises..."]', 'bench');

    // Verify only the bench press exercise is visible
    await expect(page.locator('text=Barbell Bench Press')).toBeVisible();
    await expect(page.locator('text=Squat')).not.toBeVisible();

    // Clear search
    await page.fill('input[placeholder="Search exercises..."]', '');

    // Verify both exercises are visible again
    await expect(page.locator('text=Barbell Bench Press')).toBeVisible();
    await expect(page.locator('text=Squat')).toBeVisible();
  });

  test('should not allow editing or deleting pre-populated exercises', async ({ page }) => {
    // First ensure there's at least one pre-populated exercise
    // This depends on the seed data being loaded
    // We'll check if there are any pre-populated exercises visible
    const hasPrepopulated = await page.isVisible('text=No pre-populated exercises found');

    if (hasPrepopulated) {
      // If no pre-populated exercises, we'll skip this test
      test.skip();
    } else {
      // Get the first pre-populated exercise
      const prePop = page.locator('.exercise-item').first();

      // Verify it doesn't have edit or delete buttons
      await expect(prePop.locator('button[aria-label^="Edit"]')).not.toBeVisible();
      await expect(prePop.locator('button[aria-label^="Delete"]')).not.toBeVisible();
    }
  });
});
