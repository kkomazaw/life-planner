import { test, expect } from '@playwright/test';

test.describe('Transaction Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=ライフプランナー', { timeout: 10000 });
  });

  test('should create income transaction', async ({ page }) => {
    // Navigate to transactions page
    await page.click('text=収支管理');
    await expect(page).toHaveURL(/.*transactions/);

    // Switch to income tab
    await page.click('button:has-text("収入")');

    // Open create form
    await page.click('button:has-text("新規収入を追加")');
    await page.waitForSelector('input[placeholder="収入名を入力"]');

    // Fill in income details
    await page.fill('input[placeholder="収入名を入力"]', '給与');
    await page.fill('input[placeholder="月額を入力"]', '300000');
    await page.fill('input[type="date"]', '2025-01-01');

    // Submit form
    await page.click('button:has-text("登録")');

    // Verify income was created
    await expect(page.locator('text=給与')).toBeVisible();
    await expect(page.locator('text=¥300,000')).toBeVisible();
  });

  test('should create expense transaction', async ({ page }) => {
    // Navigate to transactions page
    await page.click('text=収支管理');

    // Switch to expense tab
    await page.click('button:has-text("支出")');

    // Open create form
    await page.click('button:has-text("新規支出を追加")');
    await page.waitForSelector('input[placeholder="支出名を入力"]');

    // Fill in expense details
    await page.fill('input[placeholder="支出名を入力"]', '家賃');
    await page.fill('input[placeholder="月額を入力"]', '100000');
    await page.fill('input[type="date"]', '2025-01-01');

    // Submit form
    await page.click('button:has-text("登録")');

    // Verify expense was created
    await expect(page.locator('text=家賃')).toBeVisible();
    await expect(page.locator('text=¥100,000')).toBeVisible();
  });

  test('should edit existing transaction', async ({ page }) => {
    // Navigate to transactions page
    await page.click('text=収支管理');
    await page.click('button:has-text("収入")');

    // Assume there's at least one income from previous test
    // Click edit button (look for edit icon or button)
    const editButton = page.locator('button[aria-label="編集"]').first();
    if (await editButton.isVisible()) {
      await editButton.click();

      // Update amount
      await page.fill('input[placeholder="月額を入力"]', '350000');

      // Submit
      await page.click('button:has-text("更新")');

      // Verify update
      await expect(page.locator('text=¥350,000')).toBeVisible();
    }
  });

  test('should delete transaction', async ({ page }) => {
    // Navigate to transactions page
    await page.click('text=収支管理');
    await page.click('button:has-text("支出")');

    // Count initial transactions
    const initialCount = await page.locator('table tbody tr').count();

    if (initialCount > 0) {
      // Click delete button
      const deleteButton = page.locator('button[aria-label="削除"]').first();
      await deleteButton.click();

      // Confirm deletion
      await page.click('button:has-text("削除")');

      // Verify count decreased
      await page.waitForTimeout(500);
      const newCount = await page.locator('table tbody tr').count();
      expect(newCount).toBe(initialCount - 1);
    }
  });

  test('should display income and expense summary', async ({ page }) => {
    // Navigate to transactions page
    await page.click('text=収支管理');

    // Verify summary cards are visible
    await expect(page.locator('text=月次収入')).toBeVisible();
    await expect(page.locator('text=月次支出')).toBeVisible();
    await expect(page.locator('text=月次収支')).toBeVisible();

    // Summary should show monetary values
    const summaryCards = page.locator('.card');
    expect(await summaryCards.count()).toBeGreaterThanOrEqual(3);
  });
});
