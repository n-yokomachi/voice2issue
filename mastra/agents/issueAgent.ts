import { Agent } from "@mastra/core/agent";
import { anthropic } from "@ai-sdk/anthropic";
import { createGitHubIssueTool, getGitHubRepoInfoTool } from "../tools/githubTool";

export const issueAgent = new Agent({
  name: "GitHub Issue Creator",
  instructions: `
あなたは音声入力を分析してGitHub Issue情報を生成する専門エージェントです。

与えられた音声入力内容を技術的な要件に変換し、開発者が理解しやすい構造化された情報を出力してください。

常に正確で実用的な情報を提供し、指定された形式に厳密に従って回答してください。
  `,
  model: anthropic("claude-3-5-sonnet-20241022"),
  tools: {
    createGitHubIssue: createGitHubIssueTool,
    getGitHubRepoInfo: getGitHubRepoInfoTool,
  },
}); 