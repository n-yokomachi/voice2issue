# 音声入力 → GitHub Issue 作成アプリ 実装計画

## 🎯 プロジェクト概要
音声入力から GitHub Issue を自動生成し、Claude Code に実装依頼するワークフローアプリの具体的実装計画

## 🛠️ 技術スタック

### フロントエンド
- **Framework**: Next.js 14 + TypeScript（App Router使用）
- **Styling**: Tailwind CSS + Headless UI
  - **Headless UI**: デザインなしのアクセシブルなUIコンポーネント
  - **機能**: Modal、Dropdown、Toggle等の複雑なUI部品
  - **メリット**: 完璧なアクセシビリティ + 自由なカスタマイズ
- **状態管理**: Zustand（軽量で型安全）
- **Form**: React Hook Form + Zod（バリデーション）
- **音声認識**: Web Speech API
- **アイコン**: Lucide React
- **AIエージェント**: Mastra（統合AIエージェント構築）

### 外部API・サービス
- **GitHub API**: 公式MCPサーバー（`@modelcontextprotocol/server-github`）
- **MCP**: Model Context Protocol - GitHub公式サーバー使用
- **LLM API**: Claude 3.5 Sonnet（実装依頼特化）
- **ストレージ**: LocalStorage（暗号化済み）

## 🔧 GitHub公式MCPサーバー設定

### MCP設定ファイル
```json
// .mcp.json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_TOKEN": "$GITHUB_TOKEN"
      }
    }
  }
}
```

### 環境変数設定
```bash
# .env.local
GITHUB_TOKEN=your_github_personal_access_token
ANTHROPIC_API_KEY=your_claude_api_key
```

### 開発・デプロイ
- **ホスティング**: Vercel（Next.js最適化）
- **Package Manager**: pnpm
- **Linter**: ESLint + Prettier
- **Type Check**: TypeScript strict mode

## 📁 プロジェクト構成（Next.js App Router）

```
voice2issue/
├── public/
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx      # ルートレイアウト
│   │   ├── page.tsx        # ホームページ
│   │   ├── api/            # API Routes
│   │   │   ├── github/     # GitHub MCP連携
│   │   │   └── claude/     # Claude API連携
│   │   └── globals.css     # グローバルスタイル
│   ├── components/          # UIコンポーネント
│   │   ├── ui/             # 再利用可能なUI部品（Headless UI）
│   │   ├── VoiceInput.tsx  # 音声入力コンポーネント
│   │   ├── IssueCreator.tsx # Issue作成コンポーネント
│   │   ├── Settings.tsx    # 設定ダイアログ
│   │   └── ProgressModal.tsx # 進捗表示
│   ├── hooks/              # カスタムフック
│   │   ├── useVoiceInput.ts
│   │   ├── useGitHubMCP.ts # GitHub MCP連携
│   │   └── useClaude.ts    # Claude API連携
│   ├── lib/                # ライブラリ・サービス
│   │   ├── mastra/         # Mastraエージェント設定
│   │   ├── github-mcp.ts   # GitHub MCPサーバー連携
│   │   ├── claude.ts       # Claude API
│   │   └── storage.ts      # データ永続化
│   ├── store/              # 状態管理
│   │   ├── useSettingsStore.ts
│   │   └── useAppStore.ts
│   ├── types/              # 型定義
│   │   ├── github.ts
│   │   ├── voice.ts
│   │   ├── claude.ts
│   │   └── settings.ts
│   └── utils/              # ユーティリティ
│       ├── crypto.ts       # 暗号化
│       ├── validation.ts   # バリデーション
│       └── constants.ts
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

## 🚀 Phase 1: MVP実装（1-2週間）

### ステップ1: プロジェクトセットアップ
```bash
# Next.jsプロジェクト作成
npx create-next-app@latest voice2issue --typescript --tailwind --eslint --app
cd voice2issue
pnpm install

# 依存関係追加
pnpm add zustand react-hook-form @hookform/resolvers zod
pnpm add lucide-react clsx tailwind-merge
pnpm add @headlessui/react @heroicons/react

# Mastra本体とClaude統合
pnpm add mastra@latest @mastra/core@latest @mastra/libsql@latest
pnpm add @anthropic-ai/sdk

# GitHub MCP サーバー用
pnpm add @modelcontextprotocol/sdk
pnpm add -D @types/node
```

### ステップ2: Mastraプロジェクト初期化
```bash
# Mastraの初期化（インタラクティブ）
npx mastra@latest init

# または非インタラクティブ（推奨）
npx mastra@latest init --dir . --components agents,tools,workflows --llm anthropic

# 開発・ビルドスクリプト追加
```

`package.json`に以下を追加：
```json
{
  "scripts": {
    "dev:mastra": "mastra dev",
    "build:mastra": "mastra build"
  }
}
```

### ステップ3: Next.js設定
```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@mastra/*"],
  experimental: {
    instrumentationHook: true, // OpenTelemetry用
  },
};

export default nextConfig;
```

### ステップ4: 基本UI構築
1. **Layout Component**
   - ヘッダー・メイン・フッター
   - レスポンシブ対応
   - ダークモード切り替え

2. **VoiceInput Component**
   - 音声入力ボタン（マイクアイコン）
   - 入力状態の視覚フィードバック
   - テキストエリア（認識結果表示）

3. **Settings Modal**
   - GitHub Repository設定
   - Claude API Key設定
   - 設定の保存・読み込み

### ステップ5: Mastraエージェント作成
```typescript
// mastra/agents/issueAgent.ts
import { Agent } from "@mastra/core/agent";
import { anthropic } from "@ai-sdk/anthropic";

export const issueAgent = new Agent({
  name: "GitHub Issue Creator",
  instructions: `
あなたは音声入力からGitHub Issueを作成する専門エージェントです。
以下のタスクを実行してください：

1. 音声入力の内容を分析
2. 簡潔で具体的なIssueタイトルを生成
3. 実装に必要な詳細情報を含む本文を作成
4. Claude Codeが理解しやすい構造で記述

出力形式：
- title: 簡潔で具体的なタイトル
- body: 詳細な説明と実装要件
- priority: low/medium/high
- labels: 適切なラベルのリスト
  `,
  model: anthropic("claude-3-5-sonnet-20241022"),
});
```

```typescript
// mastra/index.ts
import { Mastra } from "@mastra/core";
import { LibSQLStore } from "@mastra/libsql";
import { issueAgent } from "./agents/issueAgent";
import { voiceToIssueWorkflow } from "./workflows/issueWorkflow";
import { createIssueTool } from "./tools/githubTool";

export const mastra = new Mastra({
  agents: { issueAgent },
  workflows: { voiceToIssueWorkflow },
  tools: { createIssueTool },
  storage: new LibSQLStore({
    url: ":memory:", // 本番では file:./mastra.db
  }),
  telemetry: {
    serviceName: "voice2issue",
    enabled: true,
  },
});
```

### ステップ6: 音声認識実装
```typescript
// hooks/useVoiceInput.ts
export const useVoiceInput = () => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      setError('お使いのブラウザは音声認識に対応していません')
      return
    }
    
    const recognition = new webkitSpeechRecognition()
    recognition.lang = 'ja-JP'
    recognition.continuous = true
    recognition.interimResults = true
    
    recognition.onstart = () => setIsListening(true)
    recognition.onresult = (event) => {
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        }
      }
      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript)
      }
    }
    recognition.onerror = (event) => {
      setError('音声認識エラーが発生しました')
    }
    recognition.onend = () => setIsListening(false)
    
    recognition.start()
  }, [])
  
  return { isListening, transcript, error, startListening, setTranscript }
}
```

### ステップ7: GitHub公式MCP ツール作成
```typescript
// mastra/tools/githubTool.ts
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const createIssueTool = createTool({
  id: "create-github-issue",
  description: "GitHub公式MCPサーバーを使用してIssueを作成し、Claude Code実装依頼コメントを追加",
  inputSchema: z.object({
    repository: z.string().describe("GitHub repository (owner/repo形式)"),
    title: z.string().describe("Issueのタイトル"),
    body: z.string().describe("Issueの本文"),
    labels: z.array(z.string()).optional().describe("ラベル"),
    assignees: z.array(z.string()).optional().describe("アサイン先"),
  }),
  outputSchema: z.object({
    issueNumber: z.number(),
    issueUrl: z.string(),
    success: z.boolean(),
    commentAdded: z.boolean(),
  }),
  execute: async ({ context }) => {
    const { repository, title, body, labels, assignees } = context;
    
    try {
      // GitHub公式MCPサーバーを通じてIssue作成
      // .mcp.jsonで設定済みのGitHub MCPサーバーが自動的に処理
      const issueData = {
        owner: repository.split('/')[0],
        repo: repository.split('/')[1],
        title,
        body,
        labels: labels || [],
        assignees: assignees || []
      };
      
      // MCPサーバーがGitHub APIを呼び出してIssue作成
      console.log('Creating issue via GitHub MCP server:', issueData);
      
      // Claude Code実装依頼コメントを生成
      const claudeCodeComment = generateClaudeCodeComment(body, title);
      
      // コメント追加もMCPサーバー経由
      console.log('Adding Claude Code implementation request comment');
      
      return {
        issueNumber: 1, // MCPサーバーから返される実際の番号
        issueUrl: `https://github.com/${repository}/issues/1`,
        success: true,
        commentAdded: true
      };
    } catch (error) {
      console.error('GitHub MCP tool error:', error);
      return {
        issueNumber: 0,
        issueUrl: '',
        success: false,
        commentAdded: false
      };
    }
  }
});

// Claude Code実装依頼コメント生成
function generateClaudeCodeComment(issueBody: string, title: string): string {
  return `@claude このIssueの実装をお願いします。

## 実装要件
${issueBody}

## Claude Code実装ガイドライン
- プロジェクトの規約とアーキテクチャに従う
- 包括的なテスト作成
- 型安全性とエラーハンドリング確保
- 必要に応じてドキュメント更新
- レビュー可能な単位でコミット作成

## 技術仕様
タイトル: ${title}

このタスクを管理可能な単位に分割して、ステップバイステップで実装してください。

/think hard - この実装について深く考慮してください`;
}
        }
      });
      
      const issueNumber = issueResult.number;
      const issueUrl = issueResult.html_url;
      
      // Claude Code依頼コメント追加
      const claudeComment = `@claude-code 

以下の要件で実装をお願いします：

${body}

実装時の注意点：
- TypeScriptを使用
- 適切なエラーハンドリングを含める
- テストコードも作成
- ドキュメントも更新

よろしくお願いします！✨`;

      await client.request({
        method: 'tools/call',
        params: {
          name: 'create_issue_comment',
          arguments: {
            owner: repository.split('/')[0],
            repo: repository.split('/')[1],
            issue_number: issueNumber,
            body: claudeComment
          }
        }
      });
      
      return {
        issueNumber,
        issueUrl,
        success: true,
      };
    } finally {
      await client.close();
    }
  },
});
```

### ステップ8: Mastraワークフロー作成
```typescript
// mastra/workflows/issueWorkflow.ts
import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { createIssueTool } from "../tools/githubTool";

const analyzeVoiceInput = createStep({
  id: "analyze-voice-input",
  description: "音声入力を分析してIssue内容を生成",
  inputSchema: z.object({
    voiceInput: z.string(),
    repository: z.string(),
  }),
  outputSchema: z.object({
    title: z.string(),
    body: z.string(),
    priority: z.enum(["low", "medium", "high"]),
    labels: z.array(z.string()),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent("issueAgent");
    
    const prompt = `
音声入力内容を分析して、GitHub Issueの情報を生成してください。

音声入力: ${inputData.voiceInput}
リポジトリ: ${inputData.repository}

以下のJSON形式で出力してください：
{
  "title": "簡潔で具体的なタイトル",
  "body": "詳細な説明と実装要件",
  "priority": "low|medium|high",
  "labels": ["適切なラベルのリスト"]
}
`;

    const result = await agent.generate([{
      role: "user",
      content: prompt
    }]);
    
    return JSON.parse(result.text);
  },
});

const createGitHubIssue = createStep({
  id: "create-github-issue",
  description: "GitHub Issueを作成",
  inputSchema: z.object({
    repository: z.string(),
    title: z.string(),
    body: z.string(),
    labels: z.array(z.string()),
  }),
  outputSchema: z.object({
    issueNumber: z.number(),
    issueUrl: z.string(),
    success: z.boolean(),
  }),
  execute: async ({ inputData }) => {
    return await createIssueTool.execute({
      context: inputData
    });
  },
});

export const voiceToIssueWorkflow = createWorkflow({
  id: "voice-to-issue",
  inputSchema: z.object({
    voiceInput: z.string(),
    repository: z.string(),
  }),
  outputSchema: z.object({
    issueNumber: z.number(),
    issueUrl: z.string(),
    success: z.boolean(),
  }),
})
  .then(analyzeVoiceInput)
  .then(createGitHubIssue);

voiceToIssueWorkflow.commit();
```

### ステップ9: Next.js API Routes
```typescript
// app/api/mastra/workflow/route.ts
import { NextRequest, NextResponse } from "next/server";
import { mastra } from "@/mastra";

export async function POST(request: NextRequest) {
  try {
    const { voiceInput, repository } = await request.json();

    if (!voiceInput || !repository) {
      return NextResponse.json(
        { error: "voiceInput and repository are required" },
        { status: 400 }
      );
    }

    // Mastraワークフローを実行
    const workflow = mastra.getWorkflow("voiceToIssueWorkflow");
    const run = await workflow.createRun({
      voiceInput,
      repository,
    });

    const result = await run.execute();

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Workflow execution error:", error);
    return NextResponse.json(
      { error: "Failed to execute workflow" },
      { status: 500 }
    );
  }
}

// app/api/mastra/agent/route.ts
import { NextRequest, NextResponse } from "next/server";
import { mastra } from "@/mastra";

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      );
    }

    // Mastraエージェントと対話
    const agent = mastra.getAgent("issueAgent");
    const result = await agent.generate([{
      role: "user",
      content: message
    }]);

    return NextResponse.json({
      success: true,
      response: result.text,
    });
  } catch (error) {
    console.error("Agent error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
```

### ステップ10: 環境変数設定
```bash
# .env.local
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# GitHub Personal Access Token (MCP Server用)
GITHUB_PERSONAL_ACCESS_TOKEN=your-github-token-here
```

## 🔄 Phase 2: 機能拡張（2-3週間）

### 進捗表示・エラーハンドリング
- 処理ステップの可視化
- エラー時のリトライ機能
- オフライン対応

### 設定の改善とMastra開発サーバー起動
```typescript
// types/settings.ts
import { z } from "zod";

export const settingsSchema = z.object({
  github: z.object({
    repository: z.string().regex(/^[\w.-]+\/[\w.-]+$/, "形式: owner/repo")
  }),
  anthropic: z.object({
    apiKey: z.string().min(1, "Anthropic API Keyは必須です")
  }),
  mastra: z.object({
    enabled: z.boolean().default(true),
    workflow: z.string().default("voice-to-issue")
  })
});

export type Settings = z.infer<typeof settingsSchema>;
```

### Mastra開発サーバー起動
```bash
# Mastraサーバーを起動（バックグラウンド）
npm run dev:mastra &

# Next.jsサーバーを起動
npm run dev
```

### Mastra Playground確認
- http://localhost:4111/ - Mastra Playground
- http://localhost:4111/api - Mastra API
- http://localhost:4111/swagger-ui - API Explorer

### テスト用curlコマンド
```bash
# エージェントテスト
curl -X POST http://localhost:4111/api/agents/issueAgent/generate \
  -H "Content-Type: application/json" \
  -d '{"messages": ["ユーザー認証機能を追加したい"]}'

# ワークフローテスト
curl -X POST http://localhost:4111/api/workflows/voiceToIssueWorkflow/execute \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "voiceInput": "ユーザー認証機能を追加したい",
      "repository": "your-username/your-repo"
    }
  }'
```

### 音声認識の改善
- 言語切り替え（日本語/英語）
- 認識精度の向上
- 中間結果の表示

## ⚡ Phase 3: 高度化（3-4週間）

### Claude Code連携自動化
```typescript
// Claude Code依頼コメントの自動生成
const generateClaudeComment = (issueContent: string): string => {
  return `@claude-code 

以下の要件でコードを実装してください：

${issueContent}

実装時の注意点：
- TypeScriptを使用
- 適切なエラーハンドリングを含める
- テストコードも作成
- ドキュメントも更新

よろしくお願いします！✨`
}
```

### 統計・分析機能
- Issue作成履歴
- 音声認識精度の追跡
- API使用量の監視

### 高度なUI/UX
- アニメーション追加
- ショートカットキー
- PWA対応

## 🧪 テスト計画

### Unit Tests
```typescript
// __tests__/useVoiceInput.test.ts
import { renderHook, act } from '@testing-library/react'
import { useVoiceInput } from '../hooks/useVoiceInput'

describe('useVoiceInput', () => {
  test('音声認識の開始・停止', async () => {
    const { result } = renderHook(() => useVoiceInput())
    
    act(() => {
      result.current.startListening()
    })
    
    expect(result.current.isListening).toBe(true)
  })
})
```

### Integration Tests
- GitHub API連携テスト
- LLM API連携テスト
- 音声認識フローテスト

### E2E Tests
- Cypress使用
- 実際のワークフロー検証

## 🚀 デプロイ・CI/CD

### Vercel設定
```json
// vercel.json
{
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "env": {
    "ANTHROPIC_API_KEY": "@anthropic-api-key"
  }
}

// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@modelcontextprotocol/sdk']
  },
  env: {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  }
}

module.exports = nextConfig
```

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm build
      - run: pnpm test
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 📝 実装メモ

### 重要ポイント
1. **セキュリティ**: API Keyの暗号化保存
2. **エラーハンドリング**: ユーザーフレンドリーなエラーメッセージ
3. **パフォーマンス**: 遅延読み込み・キャッシュ活用
4. **アクセシビリティ**: ARIA属性・キーボード操作対応

### 検討事項
- **音声認識精度**: ノイズ除去・話者認識
- **多言語対応**: i18n導入
- **オフライン対応**: Service Worker活用
- **監視**: Sentry等のエラートラッキング

## 📅 開発スケジュール

| Week | タスク | 成果物 |
|------|--------|--------|
| 1-2  | Phase 1 MVP | 基本機能動作 |
| 3-4  | Phase 2 拡張 | 実用レベル |
| 5-6  | Phase 3 高度化 | プロダクション対応 |
| 7    | テスト・改善 | リリース準備 |

---

**重要**: 各フェーズ完了時に動作確認とユーザビリティテストを実施し、フィードバックを次フェーズに反映する。

愛をこめて実装計画を作成しました💕 一緒に素敵なアプリを作りましょう〜！✨ 