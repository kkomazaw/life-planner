import { test, expect } from '@playwright/test';

test.describe('Asset Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for database initialization
    await page.waitForSelector('text=ライフプランナー', { timeout: 10000 });
  });

  test('should create a new asset and add valuation', async ({ page }) => {
    // Navigate to assets page
    await page.click('text=資産管理');
    await expect(page).toHaveURL(/.*assets/);

    // Open create asset form
    await page.click('button:has-text("新規資産を追加")');
    await page.waitForSelector('input[placeholder="資産名を入力"]');

    // Fill in asset details
    await page.fill('input[placeholder="資産名を入力"]', 'テスト銀行普通預金');
    await page.selectOption('select', { label: '現金・預金' });
    await page.fill('input[placeholder="初期評価額を入力"]', '1000000');

    // Submit form
    await page.click('button:has-text("登録")');

    // Verify asset was created
    await expect(page.locator('text=テスト銀行普通預金')).toBeVisible();
    await expect(page.locator('text=¥1,000,000')).toBeVisible();

    // Add a new valuation
    await page.click('text=テスト銀行普通預金');
    await page.click('button:has-text("評価額を記録")');
    await page.fill('input[type="number"]', '1200000');

    // Submit valuation
    await page.click('button:has-text("記録")');

    // Verify valuation was added
    await expect(page.locator('text=¥1,200,000')).toBeVisible();
  });

  test('should display assets in portfolio chart', async ({ page }) => {
    // Navigate to dashboard
    await page.click('text=ダッシュボード');
    await expect(page).toHaveURL('/');

    // Check for portfolio chart
    await expect(page.locator('text=資産構成')).toBeVisible();

    // Chart should be rendered (Recharts SVG)
    const chart = page.locator('svg.recharts-surface');
    await expect(chart).toBeVisible();
  });

  test('should run simulation with created assets', async ({ page }) => {
    // Navigate to simulation page
    await page.click('text=シミュレーション');
    await expect(page).toHaveURL(/.*simulation/);

    // Run simulation
    await page.click('button:has-text("シミュレーション実行")');

    // Wait for results
    await page.waitForSelector('text=30年後の総資産', { timeout: 5000 });

    // Verify results are displayed
    await expect(page.locator('text=最大資産額')).toBeVisible();
    await expect(page.locator('text=最小資産額')).toBeVisible();

    // Check for yearly data table
    await expect(page.locator('text=年次推移')).toBeVisible();
    await expect(page.locator('text=0年後')).toBeVisible();
  });

  test('should save and compare scenarios', async ({ page }) => {
    // Navigate to simulation page
    await page.click('text=シミュレーション');

    // Open settings
    await page.click('button:has-text("詳細設定")');

    // Update scenario name
    await page.fill('input[placeholder="シナリオ名を入力"]', 'マイ楽観的シナリオ');

    // Load optimistic preset
    await page.click('button:has-text("楽観的")');

    // Run simulation
    await page.click('button:has-text("シミュレーション実行")');
    await page.waitForSelector('text=30年後の総資産', { timeout: 5000 });

    // Save scenario
    await page.click('button:has-text("シナリオ保存")');

    // Wait for save confirmation
    await page.waitForTimeout(500);

    // Navigate to comparison tab
    await page.click('text=シナリオ比較');

    // Select saved scenario
    await page.click('text=マイ楽観的シナリオ');

    // Verify comparison chart appears
    await expect(page.locator('text=資産推移の比較')).toBeVisible();
    await expect(page.locator('text=サマリー比較')).toBeVisible();
  });
});
