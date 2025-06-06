import { NextRequest, NextResponse } from "next/server";
import { createGitHubIssue } from "@/lib/github";
import { mastra } from "@/mastra";

export async function POST(request: NextRequest) {
  try {
    const { voiceInput, repository, githubToken } = await request.json();

    if (!voiceInput || !repository) {
      return NextResponse.json(
        { error: "voiceInput and repository are required" },
        { status: 400 }
      );
    }

    console.log('Processing voice input for GitHub Issue:', { voiceInput, repository });

    // Mastraエージェントで音声入力を分析
    const agent = mastra.getAgent("issueAgent");
    
    const prompt = `
音声入力内容を分析して、GitHub Issueの情報を生成してください。

音声入力: ${voiceInput}
リポジトリ: ${repository}

以下のJSON形式で出力してください：
{
  "title": "簡潔で具体的なタイトル",
  "body": "詳細な説明と実装要件",
  "priority": "low|medium|high",
  "labels": ["適切なラベルのリスト"]
}
`;

    const agentResult = await agent.generate([{
      role: "user",
      content: prompt
    }]);

    console.log('Agent analysis result:', agentResult.text);

    let issueData;
    try {
      issueData = JSON.parse(agentResult.text);
    } catch (error) {
      // JSONパースエラーの場合はデフォルト値を使用
      console.error('Failed to parse agent response:', error);
      issueData = {
        title: voiceInput.substring(0, 50) + "...",
        body: `## 要件

${voiceInput}

## 実装内容
音声入力の内容を基に実装を進めてください。

## 優先度
medium`,
        priority: "medium",
        labels: ["enhancement"]
      };
    }

    // デモモードの場合はシミュレーション
    if (!githubToken) {
      const simulatedIssueNumber = Math.floor(Math.random() * 1000) + 1;
      const issueUrl = `https://github.com/${repository}/issues/${simulatedIssueNumber}`;
      
      return NextResponse.json({
        success: true,
        data: {
          issueNumber: simulatedIssueNumber,
          issueUrl,
          success: true,
          commentAdded: true,
          agentAnalysis: issueData,
          demo: true
        },
      });
    }

    // 実際のGitHub Issue作成
    const result = await createGitHubIssue({
      repository,
      title: issueData.title,
      body: issueData.body,
      labels: issueData.labels || [],
      githubToken,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        agentAnalysis: issueData,
        demo: false
      },
    });
  } catch (error) {
    console.error("GitHub Issue creation error:", error);
    return NextResponse.json(
      { 
        error: "Failed to create GitHub issue", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
} 