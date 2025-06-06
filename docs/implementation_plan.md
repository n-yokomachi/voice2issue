# 音声入力でIssue作成→Claude Code Action実装 - 詳細要件

## 概要
音声入力から GitHub Issue を自動生成し、Claude Code に実装を依頼するワークフローを構築する Web アプリケーション

## 機能要件

### 1. 音声入力機能
- **音声入力開始/終了ボタン**
  - 押下で音声入力開始
  - 音声入力中は終了ボタンにトグル
  - **Web Speech API を使用**（ブラウザ標準機能）
    - **自前LLM不要**: ブラウザが音声認識を処理（コスト削減💰）
    - **リアルタイム処理**: 音声をリアルタイムでテキスト変換
    - **主要ブラウザサポート**: Chrome（完全対応）、Safari（対応）、Edge（部分対応）
    - **注意**: Chromeは音声データをGoogleサーバーに送信（オフライン動作不可）
  - **言語設定**: 日本語（ja-JP）/英語（en-US）切り替え対応
  - **ブラウザ対応状況の表示**: 非対応ブラウザでの代替手段提示
  - **Mastraとの比較**:
    - Mastra: 複数STTプロバイダー統合、音声ファイルアップロード、API料金必要
    - Web Speech API: ブラウザ標準、リアルタイム、無料、軽量実装

### 2. 音声入力結果表示
- **テキストエリア**
  - 音声認識結果のリアルタイム表示
  - 後から手動で内容修正可能
  - 音声入力中は無効化 & 「音声入力中...」表示
  - **追加検討**: 文字数制限の設定
  - **追加検討**: 自動保存機能（ブラウザストレージ）

### 3. GitHub Issue 作成機能
- **Issue 作成ボタン**
  - LLM API に要件を送信してタイトル・内容を生成
  - GitHub API で Issue を作成
  - Claude Code への依頼コメントを自動追加
  - **進捗表示**:
    1. LLM でタイトル・内容生成中...
    2. GitHub Issue 作成中...
    3. Claude Code への依頼コメント追加中...
    4. 完了（Issue リンク表示）

### 4. 設定ダイアログ
- **GitHub 設定**
  - Personal Access Token
  - リポジトリ名（owner/repo 形式）
  - **追加**: トークン権限の検証機能
- **LLM API 設定**
  - API キー
  - エンドポイント URL（複数 LLM 対応）
  - **追加**: API 接続テスト機能
- **その他設定**
  - **追加**: Claude Code への依頼テンプレート設定
  - **追加**: Issue ラベルの自動付与設定

### 5. UI/UX 要件
- **レスポンシブ対応**
  - スマートフォン・タブレット・デスクトップ対応
- **イケてる UI**
  - モダンなデザインシステム採用
  - アクセシビリティ対応
  - ダークモード対応
  - アニメーション・マイクロインタラクション

## 技術要件

### フロントエンド
- **音声認識**: Web Speech API
  - **SpeechRecognition インターフェース**使用
  - **ブラウザサポート検証**: `window.SpeechRecognition || window.webkitSpeechRecognition`
  - **設定可能オプション**:
    - `continuous`: 継続的認識の有効/無効
    - `interimResults`: 中間結果の表示
    - `maxAlternatives`: 代替候補数
    - `lang`: 認識言語（ja-JP, en-US等）
  - **フォールバック戦略**:
    - 非対応ブラウザ: ファイルアップロード + 外部STT API
    - 認識失敗時: 手動テキスト入力への切り替え
- **HTTP 通信**: GitHub API, LLM API
- **状態管理**: 設定データの永続化
- **エラーハンドリング**: ネットワークエラー、API エラー対応

### 外部 API 連携
- **GitHub API v4 (GraphQL) または REST API v3**
  - Issue 作成
  - コメント追加
  - リポジトリ情報取得
- **LLM API**
  - OpenAI GPT-4/Claude/Gemini 等
  - プロンプトエンジニアリング

## セキュリティ要件

### 認証情報の保護
- **クライアントサイド暗号化**: API キー・トークンの安全な保存
- **HTTPS 必須**: 全通信の暗号化
- **CORS 対応**: 外部 API へのセキュアなアクセス

### プライバシー保護
- **音声データ**: ブラウザ内処理、外部送信なし
- **入力内容**: ユーザー同意なしの保存禁止

## GitHub Actions ワークフロー設定

### Claude Code 連携
```yaml
name: Claude Code Integration
on:
  issue_comment:
    types: [created]
jobs:
  claude-code:
    if: contains(github.event.comment.body, '@claude')
    # Claude Code 実行処理
```

### 自動デプロイ・テスト
```yaml
name: Deploy Preview
on:
  pull_request:
    types: [opened, synchronize]
jobs:
  deploy:
    # Vercel デプロイ
    # テスト URL をコメント追加
```

## 事前検討が必要な項目

### 1. LLM プロンプト設計
- Issue タイトル・内容生成の品質向上
- Claude Code への指示の最適化
- 複数回の対話による要件詳細化

### 2. エラーハンドリング戦略
- API レート制限対応
- ネットワーク障害時の動作
- 音声認識失敗時のフォールバック

### 3. パフォーマンス最適化
- 大きな音声入力の処理
- API レスポンスの高速化
- UI の応答性向上

### 4. ユーザビリティテスト
- 音声入力の精度検証
- モバイル端末での操作性
- アクセシビリティ準拠

### 5. データ管理
- 設定データのバックアップ・復元
- 過去の Issue 作成履歴
- 使用量・統計の追跡

## 実装優先度

### Phase 1（MVP）
1. 基本的な音声入力機能
2. シンプルな GitHub Issue 作成
3. 最小限の設定画面

### Phase 2（機能拡張）
1. 進捗表示・エラーハンドリング
2. LLM プロンプト最適化
3. UI/UX 改善

### Phase 3（高度化）
1. 複数 LLM 対応
2. 高度な設定オプション
3. 分析・統計機能

## 開発環境・デプロイ
- **開発**: React/Vue.js + TypeScript
- **ホスティング**: Vercel/Netlify
- **CI/CD**: GitHub Actions
- **監視**: エラー追跡・パフォーマンス監視

---

**重要**: 上記要件について、特に音声認識の精度、LLM プロンプトの品質、GitHub Actions との連携部分は実装前に十分な検証が必要です。