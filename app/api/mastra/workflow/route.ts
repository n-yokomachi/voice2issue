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

    console.log('Testing Mastra agent with:', { voiceInput, repository });

    // とりあえずMastraエージェントをテスト
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

    const result = await agent.generate([{
      role: "user",
      content: prompt
    }]);

    // シミュレートされたIssue作成
    const simulatedIssueNumber = Math.floor(Math.random() * 1000) + 1;
    const issueUrl = `https://github.com/${repository}/issues/${simulatedIssueNumber}`;

    return NextResponse.json({
      success: true,
      data: {
        issueNumber: simulatedIssueNumber,
        issueUrl,
        agentResponse: result.text,
        success: true
      },
    });
  } catch (error) {
    console.error("Agent execution error:", error);
    return NextResponse.json(
      { error: "Failed to execute agent", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 