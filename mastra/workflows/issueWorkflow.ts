import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { Octokit } from "@octokit/rest";
import Anthropic from "@anthropic-ai/sdk";

const analyzeVoiceInput = createStep({
  id: "analyze-voice-input",
  description: "音声入力を分析してIssue内容を生成",
  inputSchema: z.object({
    voiceInput: z.string(),
    repository: z.string(),
    githubToken: z.string(),
    anthropicApiKey: z.string(),
  }),
  outputSchema: z.object({
    repository: z.string(),
    githubToken: z.string(),
    title: z.string(),
    body: z.string(),
    priority: z.enum(["low", "medium", "high"]),
    labels: z.array(z.string()),
  }),
  execute: async ({ inputData, mastra }) => {
    // APIキーを動的に設定してエージェントを呼び出し
    const Anthropic = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic({
      apiKey: inputData.anthropicApiKey,
    });

    const prompt = `音声入力: "${inputData.voiceInput}"
    
音声入力内容を分析して、GitHub Issueの情報を生成してください。

あなたの役割：
- 音声入力の自然な表現を技術的な要件に正確に変換
- 開発者が迷わず実装できる明確で実行可能な指示
- 実装の優先度と難易度を適切に評価

以下のJSON形式で厳密に出力してください：
{
  "title": "簡潔で具体的なタイトル",
  "body": "詳細な説明と実装要件",
  "priority": "low" | "medium" | "high",
  "labels": ["適切なラベル1", "適切なラベル2"]
}

重要: 必ずJSON形式のみで回答し、JSON以外のテキストは一切含めないでください。
    `;
    
    const result = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    });
    
    try {
      const responseText = result.content[0].type === 'text' ? result.content[0].text : '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        repository: inputData.repository,
        githubToken: inputData.githubToken,
        title: parsed.title,
        body: parsed.body,
        priority: parsed.priority,
        labels: parsed.labels || [],
      };
    } catch (error) {
      console.error('Failed to parse agent response:', error);
      
      // フォールバック: シンプルなIssue情報を生成
      return {
        repository: inputData.repository,
        githubToken: inputData.githubToken,
        title: `音声入力による新機能要求`,
        body: `音声入力内容:\n${inputData.voiceInput}\n\nこの内容に基づいて実装をお願いします。`,
        priority: "medium" as const,
        labels: ["enhancement", "voice-input"],
      };
    }
  },
});

const createGitHubIssue = createStep({
  id: "create-github-issue",
  description: "GitHub Issueを作成",
  inputSchema: z.object({
    repository: z.string(),
    githubToken: z.string(),
    title: z.string(),
    body: z.string(),
    priority: z.enum(["low", "medium", "high"]),
    labels: z.array(z.string()),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    issueNumber: z.number(),
    issueUrl: z.string(),
    commentAdded: z.boolean(),
    error: z.string().optional(),
  }),
  execute: async ({ inputData }) => {
    console.log('Creating GitHub Issue with data:', inputData);
    
    try {
      // GitHub Personal Access Tokenをユーザー入力から取得
      const token = inputData.githubToken;
      if (!token) {
        throw new Error('GitHubトークンが提供されていません');
      }

      // Octokitクライアントの初期化
      const octokit = new Octokit({ auth: token });

      // リポジトリ名の分割と検証
      const [owner, repo] = inputData.repository.split('/');
      if (!owner || !repo) {
        throw new Error(`無効なリポジトリ形式: ${inputData.repository}`);
      }

      // 優先度に基づいてラベルを追加
      const priorityLabels = {
        low: ["priority: low"],
        medium: ["priority: medium"],
        high: ["priority: high", "urgent"]
      };
      
      const allLabels = [...inputData.labels, ...priorityLabels[inputData.priority]];
      
      console.log(`📝 GitHub Issue作成開始: ${owner}/${repo}`);

      // GitHub Issue作成
      const issueResponse = await octokit.rest.issues.create({
        owner,
        repo,
        title: inputData.title,
        body: inputData.body || '',
        labels: allLabels,
        assignees: [], // 必要に応じて設定
      });

      const issueNumber = issueResponse.data.number;
      const issueUrl = issueResponse.data.html_url;

      console.log(`✅ Issue作成成功: #${issueNumber} - ${issueUrl}`);

      // Claude Code実装依頼コメントの作成と追加
      let commentAdded = false;
      try {
        const claudeCodeComment = generateClaudeCodeComment(inputData.body, inputData.title);
        
        await octokit.rest.issues.createComment({
          owner,
          repo,
          issue_number: issueNumber,
          body: claudeCodeComment,
        });
        
        commentAdded = true;
        console.log(`💬 Claude Codeコメント追加成功`);
      } catch (commentError) {
        console.warn(`⚠️ Claude Codeコメント追加失敗:`, commentError);
        // コメント追加の失敗はIssue作成の成功を妨げない
      }

      return {
        success: true,
        issueNumber,
        issueUrl,
        commentAdded,
      };
      
    } catch (error) {
      console.error('Error in createGitHubIssue step:', error);
      
      return {
        success: false,
        issueNumber: 0,
        issueUrl: '',
        commentAdded: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
});

/**
 * Claude Code実装依頼コメント生成関数
 */
function generateClaudeCodeComment(issueBody: string, title: string): string {
  return `@claude このIssueの実装をお願いします。実装タスクを分割し、ステップバイステップで実装してください。

## 📋 実装要件
${issueBody}

## 🛠️ 実装ガイドライン
- **アーキテクチャ**: プロジェクトの既存の規約とアーキテクチャに従って実装
- **テスト**: 包括的なテストケースを作成（unit test、integration test）
- **型安全性**: TypeScriptの型安全性を最大限活用
- **エラーハンドリング**: 適切なエラーハンドリングと例外処理を実装
- **ドキュメント**: 必要に応じてREADMEやコメントを更新
- **コミット**: レビューしやすい単位でコミットを分割

## 🎯 技術仕様
**タイトル**: ${title}

---
*このコメントは Voice2Issue アプリケーションによって自動生成されました*`;
}

export const voiceToIssueWorkflow = createWorkflow({
  id: "voice-to-issue",
  inputSchema: z.object({
    voiceInput: z.string(),
    repository: z.string(),
    githubToken: z.string(),
    anthropicApiKey: z.string(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    issueNumber: z.number(),
    issueUrl: z.string(),
    commentAdded: z.boolean(),
    error: z.string().optional(),
  }),
})
  .then(analyzeVoiceInput)
  .then(createGitHubIssue);

voiceToIssueWorkflow.commit(); 