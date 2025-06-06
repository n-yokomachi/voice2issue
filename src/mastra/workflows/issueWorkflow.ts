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
    repository: z.string(),
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
    
    try {
      const parsed = JSON.parse(result.text);
      return {
        repository: inputData.repository,
        ...parsed
      };
    } catch (error) {
      // JSONパースエラーの場合はデフォルト値を返す
      console.error('Failed to parse agent response:', error);
      return {
        repository: inputData.repository,
        title: inputData.voiceInput.substring(0, 50) + "...",
        body: inputData.voiceInput,
        priority: "medium" as const,
        labels: ["enhancement"]
      };
    }
  },
});

const createGitHubIssue = createStep({
  id: "create-github-issue", 
  description: "GitHub Issueを作成",
  inputSchema: z.object({
    repository: z.string(),
    title: z.string(),
    body: z.string(),
    priority: z.enum(["low", "medium", "high"]),
    labels: z.array(z.string()),
  }),
  outputSchema: z.object({
    issueNumber: z.number(),
    issueUrl: z.string(),
    success: z.boolean(),
  }),
  execute: async ({ inputData }) => {
    console.log('Creating GitHub Issue with data:', inputData);
    
    // 現時点ではシミュレーション実装
    const simulatedIssueNumber = Math.floor(Math.random() * 1000) + 1;
    const issueUrl = `https://github.com/${inputData.repository}/issues/${simulatedIssueNumber}`;
    
    return {
      issueNumber: simulatedIssueNumber,
      issueUrl,
      success: true,
    };
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