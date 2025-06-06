import { NextRequest, NextResponse } from "next/server";
import { testGitHubConnection } from "@/lib/github";

export async function POST(request: NextRequest) {
  try {
    const { githubToken } = await request.json();

    if (!githubToken) {
      return NextResponse.json(
        { error: "GitHub token is required" },
        { status: 400 }
      );
    }

    const result = await testGitHubConnection(githubToken);

    return NextResponse.json({
      success: result.success,
      user: result.user,
      error: result.error,
    });
  } catch (error) {
    console.error("GitHub connection test error:", error);
    return NextResponse.json(
      { 
        error: "Failed to test GitHub connection", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
} 