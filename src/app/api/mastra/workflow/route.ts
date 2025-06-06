import { NextRequest, NextResponse } from "next/server";
import { mastra } from "../../../../../mastra";

export async function POST(request: NextRequest) {
  try {
    const { voiceInput, repository, githubToken, anthropicApiKey } = await request.json();

    if (!voiceInput || !repository || !githubToken || !anthropicApiKey) {
      return NextResponse.json(
        { error: "voiceInput, repository, githubToken, and anthropicApiKey are required" },
        { status: 400 }
      );
    }

    console.log('Executing Mastra workflow with:', { 
      voiceInput, 
      repository, 
      hasGithubToken: !!githubToken,
      hasAnthropicApiKey: !!anthropicApiKey
    });

    // デバッグ: 利用可能なワークフロー一覧を表示
    console.log('Available workflows:', Object.keys(mastra.getWorkflows()));
    
    // Mastraワークフローを実行
    let result;
    try {
      console.log('Starting workflow execution...');
      const workflow = mastra.getWorkflow("voiceToIssueWorkflow");
      
      if (!workflow) {
        throw new Error('Workflow not found: voiceToIssueWorkflow');
      }

      // Mastraワークフローの実行 - createRun()からstart()を使用
      const run = workflow.createRun();
      result = await run.start({
        inputData: {
          voiceInput,
          repository,
          githubToken,
          anthropicApiKey,
        }
      });
      
      console.log('Workflow execution completed:', result);
      
      // Mastraワークフロー結果の構造に合わせて処理
      if (result.status === 'success' && result.result) {
        return NextResponse.json({
          success: result.result.success ?? false,
          issueUrl: result.result.issueUrl ?? '',
          issueNumber: result.result.issueNumber ?? 0,
          commentAdded: result.result.commentAdded ?? false,
        });
      } else {
        throw new Error(`Workflow execution failed with status: ${result.status}`);
      }
      
    } catch (workflowError) {
      console.error('Workflow execution failed:', workflowError);
      
      return NextResponse.json({
        success: false,
        error: `Workflow execution failed: ${workflowError instanceof Error ? workflowError.message : 'Unknown error'}`,
        details: {
          message: workflowError instanceof Error ? workflowError.message : String(workflowError),
          stack: workflowError instanceof Error ? workflowError.stack : undefined,
        },
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Agent execution error:", error);
    return NextResponse.json(
      { error: "Failed to execute agent", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 