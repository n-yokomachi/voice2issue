import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const createIssueTool = createTool({
  id: "create-github-issue",
  description: "GitHub Issue作成とClaude Code実装依頼コメント追加",
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
      console.log('Creating GitHub Issue:', { repository, title, body, labels, assignees });
      
      // TODO: 実際のGitHub API連携（現在はシミュレーション）
      // GitHub REST APIまたはMCPサーバーを使用してIssue作成
      const simulatedIssueNumber = Math.floor(Math.random() * 1000) + 1;
      const issueUrl = `https://github.com/${repository}/issues/${simulatedIssueNumber}`;
      
      // Claude Code実装依頼コメント生成
      const claudeCodeComment = generateClaudeCodeComment(body, title);
      console.log('Generated Claude Code comment:', claudeCodeComment);
      
      // TODO: GitHub APIでコメント追加
      console.log('Adding Claude Code implementation request comment');
      
      return {
        issueNumber: simulatedIssueNumber,
        issueUrl,
        success: true,
        commentAdded: true
      };
    } catch (error) {
      console.error('GitHub tool error:', error);
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

よろしくお願いします！✨`;
} 