# E2E Tests

このディレクトリには、Playwrightを使用したEnd-to-End（E2E）テストが含まれています。

## テスト構成

### テストファイル

1. **asset-management.spec.ts** - 資産管理フロー
   - 資産の作成と評価額の記録
   - ポートフォリオチャートの表示
   - シミュレーションの実行
   - シナリオの保存と比較

2. **transaction-management.spec.ts** - 収支管理フロー
   - 収入の作成・編集・削除
   - 支出の作成・編集・削除
   - 収支サマリーの表示

3. **life-event-planning.spec.ts** - ライフイベント計画フロー
   - 一時イベントの作成
   - 継続イベントの作成
   - イベントのフィルタリング
   - イベントの編集・削除
   - タイムライン表示

4. **data-import-export.spec.ts** - データインポート/エクスポートフロー
   - JSONエクスポート
   - データインポート
   - データクリア

## テストの実行

### すべてのテストを実行

```bash
npm run test:e2e
```

### UIモードで実行

```bash
npm run test:e2e:ui
```

### ブラウザを表示して実行

```bash
npm run test:e2e:headed
```

### デバッグモードで実行

```bash
npm run test:e2e:debug
```

### 特定のテストファイルを実行

```bash
npx playwright test asset-management.spec.ts
```

### 特定のブラウザで実行

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## テスト設定

テスト設定は `playwright.config.ts` で管理されています。

### 主な設定項目

- **baseURL**: `http://localhost:5173` - 開発サーバーのURL
- **webServer**: 自動的に開発サーバーを起動
- **projects**: Chromium、Firefox、Webkitの3ブラウザでテスト
- **trace**: テスト失敗時にトレースを保存
- **screenshot**: テスト失敗時にスクリーンショットを保存

## テストの書き方

### 基本構造

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=ライフプランナー');
  });

  test('should do something', async ({ page }) => {
    // テストコード
    await page.click('button:has-text("ボタン")');
    await expect(page.locator('text=結果')).toBeVisible();
  });
});
```

### ベストプラクティス

1. **明確なテスト名**: テストが何を検証しているか明確に
2. **適切な待機**: `waitForSelector`や`waitForTimeout`を使用
3. **アサーション**: `expect`を使って期待値を明確に
4. **クリーンアップ**: 各テストは独立して実行可能に

## トラブルシューティング

### テストがタイムアウトする

- `timeout`オプションを増やす
- `waitForSelector`のタイムアウトを調整

### 要素が見つからない

- セレクタが正しいか確認
- ページの読み込みを待機しているか確認
- `page.screenshot()`でデバッグ

### データベースの状態

- IndexedDBは各テストで初期化される
- テスト間でデータは共有されない

## CI/CD統合

GitHubActionsなどのCI環境では、以下の環境変数を設定してください:

```yaml
env:
  CI: true
```

これにより、ヘッドレスモードで実行され、リトライ回数が増加します。
