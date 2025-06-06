import { NextRequest, NextResponse } from "next/server";
import { mastra } from "../../../../../mastra";

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
      { error: "Failed to generate response", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 