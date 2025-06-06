import { Octokit } from "@octokit/rest";

export interface CreateIssueOptions {
  repository: string; // owner/repo形式
  title: string;
  body: string;
  labels?: string[];
  assignees?: string[];
  githubToken?: string;
}

export interface CreateIssueResult {
  issueNumber: number;
  issueUrl: string;
  success: boolean;
  commentAdded: boolean;
}

// Claude Code実装依頼コメント生成
export function generateClaudeCodeComment(issueBody: string, title: string): string {
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

// GitHub Issue作成とClaude Code依頼コメント追加
export async function createGitHubIssue(options: CreateIssueOptions): Promise<CreateIssueResult> {
  try {
    if (!options.githubToken) {
      throw new Error('GitHub token is required');
    }

    const [owner, repo] = options.repository.split('/');
    if (!owner || !repo) {
      throw new Error('Repository must be in owner/repo format');
    }

    const octokit = new Octokit({
      auth: options.githubToken,
    });

    console.log('Creating GitHub Issue:', {
      owner,
      repo,
      title: options.title,
      body: options.body,
      labels: options.labels,
      assignees: options.assignees,
    });

    // Issue作成
    const issueResponse = await octokit.rest.issues.create({
      owner,
      repo,
      title: options.title,
      body: options.body,
      labels: options.labels || [],
      assignees: options.assignees || [],
    });

    const issueNumber = issueResponse.data.number;
    const issueUrl = issueResponse.data.html_url;

    console.log('GitHub Issue created:', { issueNumber, issueUrl });

    // Claude Code実装依頼コメント追加
    const claudeComment = generateClaudeCodeComment(options.body, options.title);
    
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body: claudeComment,
    });

    console.log('Claude Code comment added to issue');

    return {
      issueNumber,
      issueUrl,
      success: true,
      commentAdded: true,
    };
  } catch (error) {
    console.error('GitHub Issue creation error:', error);
    return {
      issueNumber: 0,
      issueUrl: '',
      success: false,
      commentAdded: false,
    };
  }
}

// GitHub APIの接続テスト
export async function testGitHubConnection(token: string): Promise<{ success: boolean; user?: string; error?: string }> {
  try {
    const octokit = new Octokit({ auth: token });
    const userResponse = await octokit.rest.users.getAuthenticated();
    
    return {
      success: true,
      user: userResponse.data.login,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
} 