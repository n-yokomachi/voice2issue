import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { Octokit } from "@octokit/rest";

/**
 * GitHub Issue作成ツール
 * Zennの記事を参考にしたMastraのベストプラクティスに従った実装
 */
export const createGitHubIssueTool = createTool({
  id: "create-github-issue",
  description: "GitHub Issueを作成し、Claude Code実装依頼コメントを自動追加するツール",
  inputSchema: z.object({
    repository: z.string().describe("GitHub repository (owner/repo形式)"),
    githubToken: z.string().describe("GitHub Personal Access Token"),
    title: z.string().describe("Issueのタイトル"),
    body: z.string().describe("Issueの本文"),
    labels: z.array(z.string()).optional().describe("ラベル（例: ['bug', 'enhancement']）"),
    assignees: z.array(z.string()).optional().describe("アサイン先のユーザー名"),
  }),
  outputSchema: z.object({
    success: z.boolean().describe("作成が成功したかどうか"),
    issueNumber: z.number().describe("作成されたIssueの番号"),
    issueUrl: z.string().describe("作成されたIssueのURL"),
    commentAdded: z.boolean().describe("Claude Codeコメントが追加されたかどうか"),
    error: z.string().optional().describe("エラーメッセージ（失敗時のみ）"),
  }),
  execute: async ({ context }) => {
    const { repository, githubToken, title, body, labels = [], assignees = [] } = context;
    
    try {
      // GitHub Personal Access Tokenをユーザー入力から取得
      const token = githubToken;
      if (!token) {
        throw new Error('GitHubトークンが提供されていません');
      }

      // Octokitクライアントの初期化
      const octokit = new Octokit({
        auth: token,
      });

      // リポジトリ名の分割と検証
      const [owner, repo] = repository.split('/');
      if (!owner || !repo) {
        throw new Error(`無効なリポジトリ形式: ${repository}`);
      }

      console.log(`📝 GitHub Issue作成開始: ${owner}/${repo}`);

      // GitHub Issue作成
      const issueResponse = await octokit.rest.issues.create({
        owner,
        repo,
        title,
        body: body || '',
        labels,
        assignees,
      });

      const issueNumber = issueResponse.data.number;
      const issueUrl = issueResponse.data.html_url;

      console.log(`✅ Issue作成成功: #${issueNumber} - ${issueUrl}`);

      // Claude Code実装依頼コメントの作成と追加
      let commentAdded = false;
      try {
        const claudeCodeComment = generateClaudeCodeComment(body || '', title);
        
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`❌ GitHub Issue作成失敗:`, errorMessage);
      
      return {
        success: false,
        issueNumber: 0,
        issueUrl: '',
        commentAdded: false,
        error: errorMessage,
      };
    }
  },
});

/**
 * GitHub リポジトリ情報取得ツール
 * リポジトリの基本情報を取得する補助ツール
 */
export const getGitHubRepoInfoTool = createTool({
  id: "get-github-repo-info",
  description: "GitHubリポジトリの基本情報を取得するツール",
  inputSchema: z.object({
    repository: z.string().describe("GitHub repository (owner/repo形式)"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    repoName: z.string(),
    description: z.string(),
    language: z.string(),
    stars: z.number(),
    forks: z.number(),
    openIssues: z.number(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const { repository } = context;
    
    try {
      const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
      if (!token) {
        throw new Error('GITHUB_PERSONAL_ACCESS_TOKEN環境変数が設定されていません');
      }

      const octokit = new Octokit({ auth: token });
      const [owner, repo] = repository.split('/');
      
      if (!owner || !repo) {
        throw new Error(`無効なリポジトリ形式: ${repository}`);
      }

      const response = await octokit.rest.repos.get({
        owner,
        repo,
      });

      const repoData = response.data;

      return {
        success: true,
        repoName: repoData.full_name,
        description: repoData.description || '',
        language: repoData.language || 'Unknown',
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        openIssues: repoData.open_issues_count,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        success: false,
        repoName: '',
        description: '',
        language: '',
        stars: 0,
        forks: 0,
        openIssues: 0,
        error: errorMessage,
      };
    }
  },
});

/**
 * Claude Code実装依頼コメント生成関数
 * Issueの内容に基づいて、Claude Codeが理解しやすい実装依頼コメントを生成
 */
function generateClaudeCodeComment(issueBody: string, title: string): string {
  return `@claude 
このIssueの実装をお願いします。
実装タスクを分割し、ステップバイステップで実装してください。

---
*このコメントは Voice2Issue アプリケーションによって自動生成されました*`;
}

// エクスポート用のツール配列
export const githubTools = [
  createGitHubIssueTool,
  getGitHubRepoInfoTool,
]; 