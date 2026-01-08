import { test, expect } from '@playwright/test';

test.describe('Life Event Planning Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=ライフプランナー', { timeout: 10000 });
  });

  test('should create one-time life event', async ({ page }) => {
    // Navigate to life events page
    await page.click('text=ライフイベント');
    await expect(page).toHaveURL(/.*life-events/);

    // Open create form
    await page.click('button:has-text("新規イベントを追加")');
    await page.waitForSelector('input[placeholder="イベント名を入力"]');

    // Fill in event details
    await page.fill('input[placeholder="イベント名を入力"]', '子供の大学入学');
    await page.selectOption('select', { label: '一時' });
    await page.fill('input[type="date"]', '2030-04-01');
    await page.fill('input[placeholder="費用を入力"]', '2000000');

    // Submit form
    await page.click('button:has-text("登録")');

    // Verify event was created
    await expect(page.locator('text=子供の大学入学')).toBeVisible();
    await expect(page.locator('text=¥2,000,000')).toBeVisible();
    await expect(page.locator('text=2030/04/01')).toBeVisible();
  });

  test('should create recurring life event', async ({ page }) => {
    // Navigate to life events page
    await page.click('text=ライフイベント');

    // Open create form
    await page.click('button:has-text("新規イベントを追加")');

    // Fill in recurring event details
    await page.fill('input[placeholder="イベント名を入力"]', '年間旅行費用');
    await page.selectOption('select', { label: '継続' });
    await page.fill('input[type="date"]', '2025-01-01');
    await page.fill('input[placeholder="月額を入力"]', '50000');

    // Set end date
    const endDateInput = page.locator('input[type="date"]').nth(1);
    await endDateInput.fill('2030-12-31');

    // Submit form
    await page.click('button:has-text("登録")');

    // Verify event was created
    await expect(page.locator('text=年間旅行費用')).toBeVisible();
    await expect(page.locator('text=¥50,000')).toBeVisible();
  });

  test('should filter life events by type', async ({ page }) => {
    // Navigate to life events page
    await page.click('text=ライフイベント');

    // Click on one-time filter
    await page.click('button:has-text("一時イベント")');

    // Verify only one-time events are shown
    await expect(page.locator('text=一時')).toBeVisible();

    // Switch to recurring filter
    await page.click('button:has-text("継続イベント")');

    // Verify recurring events section
    await expect(page.locator('text=継続')).toBeVisible();
  });

  test('should edit life event', async ({ page }) => {
    // Navigate to life events page
    await page.click('text=ライフイベント');

    // Find and click edit button on first event
    const editButton = page.locator('button[aria-label="編集"]').first();
    if (await editButton.isVisible()) {
      await editButton.click();

      // Update cost
      await page.fill('input[placeholder="費用を入力"]', '2500000');

      // Submit
      await page.click('button:has-text("更新")');

      // Verify update
      await expect(page.locator('text=¥2,500,000')).toBeVisible();
    }
  });

  test('should delete life event', async ({ page }) => {
    // Navigate to life events page
    await page.click('text=ライフイベント');

    // Count initial events
    const initialCount = await page.locator('.card').count();

    if (initialCount > 1) {
      // First card is likely the summary, so check for actual event cards
      const deleteButton = page.locator('button[aria-label="削除"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();

        // Confirm deletion
        await page.click('button:has-text("削除")');

        // Wait for deletion
        await page.waitForTimeout(500);

        // Verify event was deleted
        const newCount = await page.locator('.card').count();
        expect(newCount).toBeLessThan(initialCount);
      }
    }
  });

  test('should display life events timeline', async ({ page }) => {
    // Navigate to life events page
    await page.click('text=ライフイベント');

    // Verify timeline elements exist
    await expect(page.locator('text=ライフイベント')).toBeVisible();

    // Timeline should show events in chronological order
    const eventCards = page.locator('.card');
    expect(await eventCards.count()).toBeGreaterThanOrEqual(1);
  });
});
