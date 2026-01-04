# 家計簿・ライフプランニングアプリケーション 要件定義書

## 1. プロジェクト概要

### 1.1 プロジェクト名
Life Planner - 家族資産管理・ライフプランシミュレーター

### 1.2 目的
家族の資産状況を可視化し、将来のライフイベントを考慮した資産推移をシミュレーションすることで、長期的な資産形成と家計管理を支援する。

### 1.3 ターゲットユーザー
- 家計を管理する個人（単独利用）
- 長期的な資産形成を計画したい家庭
- ライフイベント（教育費、住宅購入、退職など）を見据えた資産管理が必要な人

---

## 2. 機能要件

### 2.1 資産ポートフォリオ管理機能

#### 2.1.1 資産の種類
以下の資産を月単位で記録・管理できる：
- **現金・預金**: 銀行口座、現金
- **投資（株・投信等）**: 株式、投資信託、債券、ETFなど
- **不動産**: 自宅、投資用不動産
- **その他資産**: 保険、年金、貴金属など

#### 2.1.2 資産登録機能
- 資産の種類ごとに以下の情報を登録
  - 資産名
  - 資産種別（現金・預金 / 投資 / 不動産 / その他）
  - 評価額
  - 取得日
  - 備考・メモ
- 月末時点の資産評価額を記録

#### 2.1.3 資産推移の記録
- 月ごとの資産評価額を時系列で記録
- 過去データの修正・更新が可能
- 資産ごとの増減履歴を確認

### 2.2 支出管理機能

#### 2.2.1 支出の記録（項目別月次集計）
以下のような項目別に月次で支出を記録：
- 固定費
  - 住宅費（住宅ローン、家賃）
  - 光熱費
  - 通信費
  - 保険料
  - サブスクリプション
- 変動費
  - 食費
  - 日用品費
  - 交通費
  - 医療費
  - 教育費
  - 娯楽費
  - 被服費
- その他

#### 2.2.2 支出項目のカスタマイズ
- ユーザーが独自の支出項目を追加・編集可能
- 項目の並び替え、削除が可能

#### 2.2.3 収入の記録
- 給与収入
- 副業収入
- 投資収益
- その他収入

### 2.3 ライフプラン・シミュレーション機能

#### 2.3.1 将来の収入・支出予測
- 月次ベースで将来の収入・支出を設定
- 年間ベースでの設定も可能（自動的に月次に按分）
- 定期的な収入・支出のパターン登録

#### 2.3.2 ライフイベント設定
主要なライフイベントとその費用を登録：
- 子供の進学（入学金、授業料など）
- 住宅購入・リフォーム
- 車の購入・買い替え
- 退職
- 結婚式
- その他カスタムイベント

各イベントに以下を設定：
- イベント名
- 発生時期（年月）
- 予想費用
- カテゴリ（教育 / 住宅 / 車 / 退職 / その他）

#### 2.3.3 運用利回りの設定
- 資産種別ごとに期待運用利回りを設定
- 複数のシナリオ（楽観的 / 標準 / 悲観的）を設定可能

#### 2.3.4 インフレ率の考慮
- 年間インフレ率を設定
- 将来の支出額をインフレ調整して計算

#### 2.3.5 シミュレーション実行
- 現在の資産と設定した条件に基づいて、将来の資産推移を計算
- 月次ベースで将来の資産残高を予測
- 資産がマイナスになる時期があれば警告表示
- 複数シナリオの比較が可能

### 2.4 データ可視化・レポート機能

#### 2.4.1 ダッシュボード
以下の情報を一目で把握できるダッシュボードを提供：
- 現在の総資産額
- 資産構成比（円グラフ）
- 今月の収支サマリー
- 直近の資産推移グラフ（3ヶ月、6ヶ月、1年など）
- 今後のライフイベント一覧（タイムライン表示）

#### 2.4.2 グラフ表示機能
- **資産推移グラフ**: 総資産の時系列推移（実績 + シミュレーション）
- **資産構成グラフ**: 資産種別ごとの構成比（円グラフ、積み上げ棒グラフ）
- **収支グラフ**: 月次の収入・支出推移
- **支出内訳グラフ**: 項目別支出の構成比
- グラフの期間選択（過去1年、過去3年、全期間など）

#### 2.4.3 データエクスポート機能
- **CSV出力**: 資産データ、収支データをCSV形式でエクスポート
- **Excelエクスポート**: より詳細なデータをExcel形式で出力
- エクスポート対象期間の選択が可能

#### 2.4.4 PDFレポート生成
以下の内容を含むPDFレポートを生成：
- 現在の資産サマリー
- 資産推移グラフ
- 収支推移グラフ
- ライフイベント計画
- シミュレーション結果

### 2.5 データ管理機能

#### 2.5.1 データの保存
- ローカルストレージ（ブラウザのIndexedDB）に保存
- データは端末内に保持され、外部サーバーに送信されない

#### 2.5.2 バックアップ・リストア
- データをJSON形式でエクスポート（バックアップ）
- エクスポートしたファイルからデータを復元（リストア）
- 定期的なバックアップを推奨する通知機能

#### 2.5.3 データのインポート
- 他の家計簿アプリや表計算ソフトからのデータ移行
- CSVファイルからのインポート機能

---

## 3. 非機能要件

### 3.1 プラットフォーム
- **Webアプリケーション**
- レスポンシブデザイン対応（PC、タブレット、スマートフォン）
- モダンブラウザ対応（Chrome, Firefox, Safari, Edge最新版）

### 3.2 データ保存とセキュリティ
- データはローカル環境のみに保存（プライバシー保護）
- 個人情報や金融情報が外部に送信されない
- データのバックアップはユーザー自身が管理

### 3.3 パフォーマンス
- 初回読み込み時間: 3秒以内
- ページ遷移: 1秒以内
- シミュレーション計算: 5秒以内（30年分の月次計算）

### 3.4 ユーザビリティ
- 直感的で分かりやすいUI/UX
- データ入力の手間を最小限に
- ヘルプ・ガイダンス機能

### 3.5 保守性・拡張性
- コードの可読性と保守性を重視
- 将来的な機能追加に対応しやすい設計
- テストコードの整備

---

## 4. 技術スタック

### 4.1 フロントエンド
- **React** (最新安定版)
- **TypeScript** (型安全性の確保)
- **状態管理**: Redux Toolkit または Zustand
- **スタイリング**: Tailwind CSS または styled-components
- **グラフライブラリ**: Recharts または Chart.js
- **日付処理**: date-fns
- **データ保存**: IndexedDB (Dexie.jsなどのラッパーを使用)

### 4.2 ビルドツール
- **Vite** または **Create React App**
- **ESLint** / **Prettier** (コード品質管理)

### 4.3 その他ライブラリ
- **PDF生成**: jsPDF
- **Excel出力**: xlsx (SheetJS)
- **UI コンポーネント**: Material-UI、Ant Design、またはshadcn/ui

---

## 5. データモデル案

### 5.1 Asset (資産)
```typescript
interface Asset {
  id: string;
  name: string;
  type: 'cash' | 'investment' | 'property' | 'other';
  acquisitionDate: Date;
  memo?: string;
  history: AssetHistory[];
}

interface AssetHistory {
  date: Date; // 月末日
  value: number; // 評価額
}
```

### 5.2 Expense (支出)
```typescript
interface Expense {
  id: string;
  date: Date; // 年月
  category: string; // 支出項目
  amount: number;
  memo?: string;
}

interface ExpenseCategory {
  id: string;
  name: string;
  type: 'fixed' | 'variable' | 'other';
  order: number;
}
```

### 5.3 Income (収入)
```typescript
interface Income {
  id: string;
  date: Date; // 年月
  source: string; // 収入源
  amount: number;
  memo?: string;
}
```

### 5.4 LifeEvent (ライフイベント)
```typescript
interface LifeEvent {
  id: string;
  name: string;
  date: Date; // 発生時期
  category: 'education' | 'housing' | 'vehicle' | 'retirement' | 'other';
  estimatedCost: number;
  memo?: string;
}
```

### 5.5 SimulationSettings (シミュレーション設定)
```typescript
interface SimulationSettings {
  id: string;
  name: string; // シナリオ名
  expectedReturns: {
    cash: number;
    investment: number;
    property: number;
    other: number;
  };
  inflationRate: number;
  futureIncome: FutureIncome[];
  futureExpense: FutureExpense[];
}

interface FutureIncome {
  startDate: Date;
  endDate?: Date;
  amount: number;
  frequency: 'monthly' | 'annually';
}

interface FutureExpense {
  startDate: Date;
  endDate?: Date;
  amount: number;
  frequency: 'monthly' | 'annually';
}
```

---

## 6. UI/UX要件

### 6.1 画面構成
1. **ダッシュボード**: 資産・収支の概要表示
2. **資産管理画面**: 資産の登録・編集・削除、月次評価額の入力
3. **収支管理画面**: 収入・支出の記録
4. **ライフイベント画面**: イベントの登録・編集
5. **シミュレーション画面**: 設定とシミュレーション結果表示
6. **レポート画面**: グラフ表示とエクスポート機能
7. **設定画面**: データバックアップ・リストア、その他設定

### 6.2 ナビゲーション
- サイドバーまたはトップナビゲーション
- 現在表示中のページを明確に表示
- モバイルではハンバーガーメニュー

### 6.3 操作性
- フォーム入力時のバリデーション
- データ保存時の確認メッセージ
- エラー発生時の分かりやすいメッセージ
- データ削除時の確認ダイアログ

---

## 7. 今後の拡張性

### 7.1 将来追加を検討する機能
- 銀行口座との連携（API）
- 複数シナリオの同時比較
- 目標設定機能（目標資産額、リタイア年齢など）
- 税金計算機能
- 家族メンバー別の資産管理
- クラウド同期機能
- モバイルアプリ版

### 7.2 拡張のための設計方針
- モジュラー設計
- APIの抽象化（将来的なバックエンド追加に備える）
- データモデルの拡張性を考慮

---

## 8. 開発フェーズ

### Phase 1: MVP (Minimum Viable Product)
- 資産の登録・月次評価額記録
- 収支の月次記録（項目別）
- 基本的なダッシュボード
- データのローカル保存

### Phase 2: シミュレーション機能
- ライフイベント設定
- シミュレーション計算エンジン
- シミュレーション結果の表示

### Phase 3: レポート・可視化
- 各種グラフ表示
- CSV/Excelエクスポート
- PDFレポート生成

### Phase 4: 改善・拡張
- UI/UXの改善
- パフォーマンス最適化
- ユーザーフィードバックを基にした機能追加

---

## 9. 成功基準

### 9.1 ユーザー視点
- 月次の資産状況を5分以内に記録できる
- 将来の資産推移を視覚的に理解できる
- ライフイベントを考慮した資産計画を立てられる

### 9.2 技術視点
- テストカバレッジ 70% 以上
- 主要ブラウザで問題なく動作
- データの永続化が確実に行われる

---

## 10. リスクと対策

### 10.1 データ損失のリスク
- **リスク**: ブラウザのキャッシュクリアなどでデータが消失
- **対策**: バックアップ機能の実装と定期的なバックアップの推奨

### 10.2 計算精度のリスク
- **リスク**: シミュレーション計算の精度不足
- **対策**: 計算ロジックの十分なテスト、専門家レビュー

### 10.3 ブラウザ互換性
- **リスク**: 特定ブラウザでの動作不良
- **対策**: 主要ブラウザでのクロスブラウザテスト

---

## 11. 補足事項

### 11.1 データ保護に関する方針
本アプリケーションは個人の金融情報を扱うため、以下の方針を徹底：
- データは一切外部サーバーに送信しない
- すべてのデータはユーザーのローカル環境に保存
- バックアップファイルもユーザー自身が管理

### 11.2 免責事項の表示
- シミュレーション結果はあくまで予測であり、実際の資産推移を保証するものではない
- 投資判断は自己責任で行う必要がある

---

**作成日**: 2026-01-04
**最終更新**: 2026-01-04
**バージョン**: 1.0

---
---

# 開発計画書

## 1. プロジェクトセットアップ

### 1.1 環境構築

#### ステップ 1: プロジェクトの初期化
```bash
# Viteを使用してReact + TypeScriptプロジェクトを作成
npm create vite@latest life-planner -- --template react-ts
cd life-planner
npm install
```

#### ステップ 2: 必要なライブラリのインストール
```bash
# 状態管理
npm install zustand

# スタイリング
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p

# UIコンポーネント（shadcn/uiを使用）
npx shadcn-ui@latest init

# データ保存
npm install dexie dexie-react-hooks

# 日付処理
npm install date-fns

# グラフライブラリ
npm install recharts

# エクスポート機能
npm install xlsx jspdf

# ルーティング
npm install react-router-dom

# ユーティリティ
npm install clsx tailwind-merge
npm install uuid
npm install -D @types/uuid

# バリデーション
npm install zod

# 開発ツール
npm install -D eslint prettier eslint-config-prettier
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom
```

### 1.2 プロジェクト設定ファイル

#### ESLint設定 (.eslintrc.cjs)
- TypeScript推奨ルールの適用
- Reactフック関連のルール
- Prettierとの統合

#### Prettier設定 (.prettierrc)
- コードフォーマットの統一
- printWidth: 100
- semi: true
- singleQuote: true

#### Tailwind CSS設定 (tailwind.config.js)
- カスタムカラーの定義
- レスポンシブブレークポイントの設定

#### TypeScript設定 (tsconfig.json)
- strict: true
- パスエイリアスの設定 (@/components, @/lib, など)

---

## 2. ディレクトリ構造

```
life-planner/
├── public/
├── src/
│   ├── components/          # Reactコンポーネント
│   │   ├── ui/              # shadcn/uiのコンポーネント
│   │   ├── layout/          # レイアウトコンポーネント
│   │   │   ├── Layout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── dashboard/       # ダッシュボード関連
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AssetSummary.tsx
│   │   │   ├── IncomeSummary.tsx
│   │   │   └── UpcomingEvents.tsx
│   │   ├── assets/          # 資産管理関連
│   │   │   ├── AssetList.tsx
│   │   │   ├── AssetForm.tsx
│   │   │   ├── AssetHistoryForm.tsx
│   │   │   └── AssetCard.tsx
│   │   ├── transactions/    # 収支管理関連
│   │   │   ├── IncomeForm.tsx
│   │   │   ├── ExpenseForm.tsx
│   │   │   ├── CategoryManager.tsx
│   │   │   └── TransactionList.tsx
│   │   ├── lifeEvents/      # ライフイベント関連
│   │   │   ├── LifeEventList.tsx
│   │   │   ├── LifeEventForm.tsx
│   │   │   └── EventTimeline.tsx
│   │   ├── simulation/      # シミュレーション関連
│   │   │   ├── SimulationSettings.tsx
│   │   │   ├── SimulationResult.tsx
│   │   │   └── ScenarioComparison.tsx
│   │   ├── reports/         # レポート関連
│   │   │   ├── Charts.tsx
│   │   │   ├── AssetChart.tsx
│   │   │   ├── IncomeExpenseChart.tsx
│   │   │   └── ExportButtons.tsx
│   │   └── settings/        # 設定関連
│   │       ├── Settings.tsx
│   │       ├── DataBackup.tsx
│   │       └── DataRestore.tsx
│   ├── lib/                 # ユーティリティとロジック
│   │   ├── db.ts            # Dexie.js データベース定義
│   │   ├── utils.ts         # 汎用ユーティリティ関数
│   │   ├── simulation.ts    # シミュレーション計算エンジン
│   │   ├── export.ts        # エクスポート機能
│   │   └── validators.ts    # バリデーションスキーマ
│   ├── hooks/               # カスタムフック
│   │   ├── useAssets.ts
│   │   ├── useTransactions.ts
│   │   ├── useLifeEvents.ts
│   │   └── useSimulation.ts
│   ├── store/               # Zustand ストア
│   │   ├── assetStore.ts
│   │   ├── transactionStore.ts
│   │   ├── lifeEventStore.ts
│   │   └── settingsStore.ts
│   ├── types/               # TypeScript型定義
│   │   ├── asset.ts
│   │   ├── transaction.ts
│   │   ├── lifeEvent.ts
│   │   └── simulation.ts
│   ├── pages/               # ページコンポーネント
│   │   ├── DashboardPage.tsx
│   │   ├── AssetsPage.tsx
│   │   ├── TransactionsPage.tsx
│   │   ├── LifeEventsPage.tsx
│   │   ├── SimulationPage.tsx
│   │   ├── ReportsPage.tsx
│   │   └── SettingsPage.tsx
│   ├── App.tsx              # アプリケーションのルート
│   ├── main.tsx             # エントリーポイント
│   └── index.css            # グローバルスタイル
├── tests/                   # テストファイル
│   ├── unit/
│   └── integration/
├── CLAUDE.md                # 要件定義・開発計画
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── .eslintrc.cjs
```

---

## 3. Phase 1: MVP開発 (2-3週間)

### 3.1 事前準備

#### タスク 1.1: プロジェクトセットアップ
- [ ] Viteプロジェクトの作成
- [ ] 必要なライブラリのインストール
- [ ] ESLint/Prettierの設定
- [ ] Tailwind CSSの設定
- [ ] shadcn/uiの初期化

#### タスク 1.2: 型定義の作成
**ファイル**: `src/types/`
- [ ] `asset.ts` - Asset, AssetHistory, AssetType型
- [ ] `transaction.ts` - Income, Expense, ExpenseCategory型
- [ ] `lifeEvent.ts` - LifeEvent型
- [ ] `simulation.ts` - SimulationSettings, SimulationResult型

#### タスク 1.3: データベースの設定
**ファイル**: `src/lib/db.ts`
- [ ] Dexie.jsのデータベーススキーマ定義
- [ ] テーブル定義（assets, assetHistory, incomes, expenses, expenseCategories, lifeEvents）
- [ ] インデックスの設定

### 3.2 基本機能の実装

#### タスク 1.4: 状態管理のセットアップ
**ファイル**: `src/store/`
- [ ] `assetStore.ts` - 資産データの状態管理
- [ ] `transactionStore.ts` - 収支データの状態管理
- [ ] `settingsStore.ts` - アプリケーション設定の状態管理

#### タスク 1.5: カスタムフックの作成
**ファイル**: `src/hooks/`
- [ ] `useAssets.ts` - 資産のCRUD操作
- [ ] `useTransactions.ts` - 収支のCRUD操作
- [ ] データベースとの連携

#### タスク 1.6: レイアウトの実装
**ファイル**: `src/components/layout/`
- [ ] `Layout.tsx` - 全体レイアウト
- [ ] `Sidebar.tsx` - サイドバーナビゲーション
- [ ] `Header.tsx` - ヘッダー
- [ ] レスポンシブ対応（モバイルメニュー）

#### タスク 1.7: ルーティングの設定
**ファイル**: `src/App.tsx`
- [ ] React Routerのセットアップ
- [ ] 各ページへのルート定義
- [ ] ナビゲーションの統合

### 3.3 資産管理機能

#### タスク 1.8: 資産一覧表示
**ファイル**: `src/components/assets/AssetList.tsx`
- [ ] 資産の一覧表示
- [ ] 資産種別ごとのフィルタリング
- [ ] 合計金額の表示

#### タスク 1.9: 資産登録・編集フォーム
**ファイル**: `src/components/assets/AssetForm.tsx`
- [ ] 資産名、種別、取得日、メモの入力フォーム
- [ ] バリデーション（Zod使用）
- [ ] 新規登録・更新・削除機能

#### タスク 1.10: 資産履歴の記録
**ファイル**: `src/components/assets/AssetHistoryForm.tsx`
- [ ] 月次評価額の入力フォーム
- [ ] 日付選択（date-fns使用）
- [ ] 履歴の表示・編集

### 3.4 収支管理機能

#### タスク 1.11: 支出項目カテゴリの管理
**ファイル**: `src/components/transactions/CategoryManager.tsx`
- [ ] デフォルトカテゴリの設定
- [ ] カスタムカテゴリの追加・編集・削除
- [ ] カテゴリの並び替え

#### タスク 1.12: 収入記録フォーム
**ファイル**: `src/components/transactions/IncomeForm.tsx`
- [ ] 収入源、金額、年月の入力
- [ ] バリデーション
- [ ] CRUD機能

#### タスク 1.13: 支出記録フォーム
**ファイル**: `src/components/transactions/ExpenseForm.tsx`
- [ ] カテゴリ、金額、年月の入力
- [ ] バリデーション
- [ ] CRUD機能

#### タスク 1.14: 収支一覧表示
**ファイル**: `src/components/transactions/TransactionList.tsx`
- [ ] 月次収支の表示
- [ ] カテゴリ別集計
- [ ] 期間フィルタリング

### 3.5 ダッシュボード

#### タスク 1.15: ダッシュボードの実装
**ファイル**: `src/components/dashboard/`
- [ ] `Dashboard.tsx` - メインダッシュボード
- [ ] `AssetSummary.tsx` - 総資産額と構成比の表示
- [ ] `IncomeSummary.tsx` - 今月の収支サマリー
- [ ] 簡易的なグラフ表示（Recharts使用）

### 3.6 データ管理

#### タスク 1.16: データバックアップ機能
**ファイル**: `src/components/settings/DataBackup.tsx`
- [ ] 全データをJSON形式でエクスポート
- [ ] ダウンロード機能
- [ ] バックアップ日時の表示

#### タスク 1.17: データリストア機能
**ファイル**: `src/components/settings/DataRestore.tsx`
- [ ] JSONファイルのアップロード
- [ ] データの検証
- [ ] データベースへのインポート
- [ ] 確認ダイアログ

### 3.7 テスト

#### タスク 1.18: ユニットテストの作成
- [ ] データベース操作のテスト
- [ ] ストアのテスト
- [ ] ユーティリティ関数のテスト

#### タスク 1.19: 統合テスト
- [ ] フォーム送信のテスト
- [ ] データの永続化のテスト

### 3.8 Phase 1 完了基準
- [ ] 資産の登録・編集・削除ができる
- [ ] 月次評価額を記録できる
- [ ] 収入・支出を記録できる
- [ ] ダッシュボードで概要を確認できる
- [ ] データのバックアップ・リストアができる
- [ ] ローカルストレージに正しくデータが保存される
- [ ] レスポンシブデザインが機能する

---

## 4. Phase 2: シミュレーション機能 (2-3週間)

### 4.1 ライフイベント機能

#### タスク 2.1: ライフイベントストアの作成
**ファイル**: `src/store/lifeEventStore.ts`
- [ ] ライフイベントの状態管理

#### タスク 2.2: ライフイベント一覧表示
**ファイル**: `src/components/lifeEvents/LifeEventList.tsx`
- [ ] イベントの一覧表示
- [ ] 時系列順のソート
- [ ] カテゴリ別フィルタリング

#### タスク 2.3: ライフイベント登録・編集フォーム
**ファイル**: `src/components/lifeEvents/LifeEventForm.tsx`
- [ ] イベント名、カテゴリ、日付、費用の入力
- [ ] バリデーション
- [ ] CRUD機能

#### タスク 2.4: イベントタイムライン表示
**ファイル**: `src/components/lifeEvents/EventTimeline.tsx`
- [ ] タイムライン形式での表示
- [ ] 今後のイベントのハイライト

### 4.2 シミュレーション設定

#### タスク 2.5: シミュレーション設定フォーム
**ファイル**: `src/components/simulation/SimulationSettings.tsx`
- [ ] 運用利回りの設定（資産種別ごと）
- [ ] インフレ率の設定
- [ ] 将来の収入・支出パターンの設定
- [ ] シナリオ名の設定
- [ ] 複数シナリオの保存

#### タスク 2.6: 将来収支設定UI
- [ ] 定期的な収入の設定（開始日、終了日、金額、頻度）
- [ ] 定期的な支出の設定
- [ ] 年次/月次の切り替え

### 4.3 シミュレーション計算エンジン

#### タスク 2.7: シミュレーション計算ロジック
**ファイル**: `src/lib/simulation.ts`
- [ ] 月次ベースの資産推移計算
- [ ] 運用利回りの適用
- [ ] インフレ調整
- [ ] ライフイベント費用の反映
- [ ] 将来収支の反映
- [ ] 30年分（360ヶ月）の計算

#### タスク 2.8: 計算結果の型定義
**ファイル**: `src/types/simulation.ts`
- [ ] SimulationResult型
- [ ] 月次データの配列
- [ ] 資産残高、収入、支出、イベント費用

### 4.4 シミュレーション結果表示

#### タスク 2.9: 結果表示コンポーネント
**ファイル**: `src/components/simulation/SimulationResult.tsx`
- [ ] 資産推移グラフ（実績 + 予測）
- [ ] 収支推移グラフ
- [ ] 主要な指標の表示（最大資産額、最小資産額など）
- [ ] 警告表示（資産がマイナスになる時期）

#### タスク 2.10: シナリオ比較機能
**ファイル**: `src/components/simulation/ScenarioComparison.tsx`
- [ ] 複数シナリオの同時表示
- [ ] 比較グラフ
- [ ] 差分の表示

### 4.5 テスト

#### タスク 2.11: シミュレーションロジックのテスト
- [ ] 計算精度の検証
- [ ] エッジケースのテスト（資産がマイナス、大きな金額など）
- [ ] 複利計算の検証

### 4.6 Phase 2 完了基準
- [ ] ライフイベントを登録できる
- [ ] シミュレーション設定を保存できる
- [ ] 将来の資産推移を計算できる
- [ ] シミュレーション結果をグラフで確認できる
- [ ] 複数シナリオを比較できる
- [ ] 計算が5秒以内に完了する

---

## 5. Phase 3: レポート・可視化 (2週間)

### 5.1 グラフ機能の拡充

#### タスク 3.1: 資産推移グラフ
**ファイル**: `src/components/reports/AssetChart.tsx`
- [ ] 折れ線グラフ（Recharts使用）
- [ ] 資産種別ごとの積み上げ面グラフ
- [ ] 期間選択（過去1年、3年、全期間）
- [ ] ズーム機能

#### タスク 3.2: 収支グラフ
**ファイル**: `src/components/reports/IncomeExpenseChart.tsx`
- [ ] 月次収支の棒グラフ
- [ ] 収入と支出の比較
- [ ] 累積収支のグラフ

#### タスク 3.3: 資産構成グラフ
- [ ] 円グラフ（資産種別の構成比）
- [ ] ドーナツチャート
- [ ] インタラクティブな表示

#### タスク 3.4: 支出内訳グラフ
- [ ] カテゴリ別支出の円グラフ
- [ ] 月次推移の棒グラフ

### 5.2 エクスポート機能

#### タスク 3.5: CSV出力機能
**ファイル**: `src/lib/export.ts`
- [ ] 資産データのCSV変換
- [ ] 収支データのCSV変換
- [ ] ライフイベントデータのCSV変換
- [ ] ダウンロード機能

#### タスク 3.6: Excel出力機能
- [ ] xlsxライブラリを使用したExcelファイル生成
- [ ] 複数シートの作成（資産、収支、イベント、シミュレーション結果）
- [ ] スタイル設定（ヘッダー、合計行など）

#### タスク 3.7: PDFレポート生成
- [ ] jsPDFを使用したPDF生成
- [ ] レポートのレイアウト設計
- [ ] サマリー情報の表示
- [ ] グラフの画像化と埋め込み
- [ ] ページネーション

#### タスク 3.8: エクスポートUIの実装
**ファイル**: `src/components/reports/ExportButtons.tsx`
- [ ] エクスポート形式の選択
- [ ] 期間選択
- [ ] ダウンロードボタン

### 5.3 レポート画面

#### タスク 3.9: レポート画面の実装
**ファイル**: `src/pages/ReportsPage.tsx`
- [ ] 各種グラフの表示
- [ ] フィルタリング機能
- [ ] エクスポート機能の統合

### 5.4 テスト

#### タスク 3.10: グラフ表示のテスト
- [ ] データが正しくグラフ化されるか検証
- [ ] レスポンシブ対応の確認

#### タスク 3.11: エクスポート機能のテスト
- [ ] 生成されたファイルの内容検証
- [ ] 大量データの処理テスト

### 5.5 Phase 3 完了基準
- [ ] 各種グラフが正しく表示される
- [ ] CSV/Excelファイルをエクスポートできる
- [ ] PDFレポートを生成できる
- [ ] グラフが期間選択に応じて更新される
- [ ] エクスポートファイルが正しい形式で生成される

---

## 6. Phase 4: 改善・拡張 (継続的)

### 6.1 UI/UXの改善

#### タスク 4.1: ユーザビリティテスト
- [ ] 実際のユーザーによる操作テスト
- [ ] フィードバックの収集

#### タスク 4.2: UI改善
- [ ] デザインの洗練
- [ ] アニメーションの追加
- [ ] アクセシビリティの向上
- [ ] ダークモードの実装

#### タスク 4.3: ヘルプ機能の追加
- [ ] ツールチップの追加
- [ ] オンボーディングガイド
- [ ] ヘルプドキュメント

### 6.2 パフォーマンス最適化

#### タスク 4.4: パフォーマンス計測
- [ ] Lighthouseでの評価
- [ ] ボトルネックの特定

#### タスク 4.5: 最適化の実施
- [ ] コンポーネントのメモ化（React.memo, useMemo）
- [ ] 遅延ロード（React.lazy, Suspense）
- [ ] バンドルサイズの削減
- [ ] 画像の最適化

### 6.3 機能拡張

#### タスク 4.6: データインポート機能
- [ ] CSVファイルからのインポート
- [ ] データマッピングUI
- [ ] エラーハンドリング

#### タスク 4.7: 自動バックアップ通知
- [ ] 最終バックアップ日時の記録
- [ ] 定期的なバックアップのリマインダー

#### タスク 4.8: その他の機能追加
- [ ] 通貨設定（円、ドルなど）
- [ ] 多言語対応の準備
- [ ] データ検索機能
- [ ] フィルタリングの強化

### 6.4 テストカバレッジの向上

#### タスク 4.9: テストの充実
- [ ] E2Eテストの追加（Playwright or Cypressを検討）
- [ ] テストカバレッジ70%以上を達成
- [ ] CI/CDパイプラインの構築（GitHub Actionsなど）

### 6.5 ドキュメント整備

#### タスク 4.10: ドキュメント作成
- [ ] README.mdの充実
- [ ] ユーザーマニュアルの作成
- [ ] 開発者向けドキュメント
- [ ] コントリビューションガイド

### 6.6 Phase 4 完了基準
- [ ] Lighthouseスコア 90点以上
- [ ] テストカバレッジ 70%以上
- [ ] 主要ブラウザでの動作確認完了
- [ ] ユーザーフィードバックの反映

---

## 7. 技術選定の詳細

### 7.1 採用する技術とその理由

#### React + TypeScript
- **理由**: 型安全性、コンポーネントベースの開発、豊富なエコシステム

#### Vite
- **理由**: 高速な開発サーバー、最適化されたビルド

#### Zustand
- **理由**: 軽量でシンプルな状態管理、Reduxより学習コストが低い

#### Tailwind CSS
- **理由**: ユーティリティファーストのアプローチ、高速な開発、一貫性のあるデザイン

#### shadcn/ui
- **理由**: アクセシブルで高品質なコンポーネント、カスタマイズ性が高い

#### Dexie.js
- **理由**: IndexedDBのラッパー、TypeScript対応、豊富な機能

#### Recharts
- **理由**: Reactとの統合が容易、レスポンシブ、豊富なチャートタイプ

#### date-fns
- **理由**: 軽量、Tree-shaking対応、モダンなAPI

### 7.2 代替案との比較

#### 状態管理: Zustand vs Redux Toolkit
- Zustandを選択: シンプルで学習コストが低い、ボイラープレートが少ない
- Redux Toolkitは大規模アプリケーション向けだが、本プロジェクトには過剰

#### UIライブラリ: shadcn/ui vs Material-UI vs Ant Design
- shadcn/uiを選択: カスタマイズ性が高い、バンドルサイズが小さい
- Material-UIやAnt Designは完成度が高いが、カスタマイズに制約がある

#### グラフ: Recharts vs Chart.js
- Rechartsを選択: React向けに設計されている、宣言的なAPI
- Chart.jsは汎用的だが、Reactとの統合に追加のラッパーが必要

---

## 8. 開発の進め方

### 8.1 開発フロー

1. **タスクの選択**: 各フェーズのタスクリストから次のタスクを選択
2. **ブランチ作成**: `git checkout -b feature/task-name`
3. **実装**: 機能の実装とテストの作成
4. **コミット**: `git commit -m "feat: タスクの説明"`
5. **テスト**: ローカルでのテスト実行
6. **マージ**: mainブランチへのマージ
7. **動作確認**: 統合テスト

### 8.2 コミットメッセージ規約

Conventional Commitsに従う:
- `feat:` - 新機能
- `fix:` - バグ修正
- `docs:` - ドキュメント
- `style:` - コードスタイル
- `refactor:` - リファクタリング
- `test:` - テスト追加・修正
- `chore:` - ビルドプロセスやツールの変更

### 8.3 品質管理

- **コードレビュー**: 重要な変更は自己レビュー
- **テスト**: 新機能には必ずテストを追加
- **ESLint/Prettier**: コミット前に実行
- **型チェック**: `tsc --noEmit` で型エラーがないことを確認

### 8.4 進捗管理

- タスクリストのチェックボックスで進捗を管理
- 各フェーズ完了時に完了基準を確認
- 問題が発生した場合はCLAUDE.mdに記録

---

## 9. マイルストーン

### マイルストーン 1: Phase 1 MVP完成 (3週間後)
- 資産・収支の記録が可能
- 基本的なダッシュボード表示
- データの永続化

### マイルストーン 2: Phase 2 シミュレーション完成 (6週間後)
- ライフイベント管理
- 将来の資産推移シミュレーション
- シナリオ比較

### マイルストーン 3: Phase 3 レポート機能完成 (8週間後)
- 各種グラフ表示
- CSV/Excel/PDFエクスポート

### マイルストーン 4: Phase 4 製品版リリース (10週間後)
- UI/UX改善
- パフォーマンス最適化
- ドキュメント完備

---

## 10. リスク管理

### リスク 1: 技術的な障害
- **対策**: 新しいライブラリは小さなプロトタイプで事前検証
- **対策**: 代替案を常に用意（例: RechartsがうまくいかなければChart.js）

### リスク 2: スコープクリープ
- **対策**: 各フェーズの完了基準を厳守
- **対策**: 新機能の追加はPhase 4以降に延期

### リスク 3: パフォーマンス問題
- **対策**: 早い段階でパフォーマンステスト
- **対策**: 大量データでのテスト（10年分のデータなど）

### リスク 4: ブラウザ互換性
- **対策**: 開発初期から複数ブラウザでテスト
- **対策**: Polyfillの使用を検討

---

## 11. 次のステップ

開発計画が承認されたら、以下の順序で進めます：

1. **プロジェクトセットアップ** (1日)
   - Viteプロジェクト作成
   - ライブラリインストール
   - 設定ファイルの作成

2. **型定義とデータベース設定** (1日)
   - 型定義ファイルの作成
   - Dexie.jsのセットアップ

3. **Phase 1 の開発開始** (2-3週間)
   - タスク1.4から順次実装

この開発計画に従って、段階的に機能を実装していきます。各フェーズ完了時に動作確認とテストを実施し、品質を確保します。

---

**開発計画 作成日**: 2026-01-04
**開発計画 バージョン**: 1.0
