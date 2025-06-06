import { Mastra } from "@mastra/core";
import { LibSQLStore } from "@mastra/libsql";
import { issueAgent } from "./agents/issueAgent";
import { voiceToIssueWorkflow } from "./workflows/issueWorkflow";

export const mastra = new Mastra({
  agents: { issueAgent },
  workflows: { voiceToIssueWorkflow },
  storage: new LibSQLStore({
    url: ":memory:",
  }),
  telemetry: {
    serviceName: "voice2issue",
    enabled: false, // 開発時はfalseにしてトラブル回避
  }
});

// Mastra初期化後にworkflowを適切に登録
export const getVoiceToIssueWorkflow = () => {
  return mastra.getWorkflow("voiceToIssueWorkflow");
};
        