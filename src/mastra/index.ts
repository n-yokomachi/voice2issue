import { Mastra } from "@mastra/core";
import { LibSQLStore } from "@mastra/libsql";
import { issueAgent } from "./agents/issueAgent";
import { voiceToIssueWorkflow } from "./workflows/issueWorkflow";

export const mastra = new Mastra({
  agents: { issueAgent },
  workflows: { voiceToIssueWorkflow },
  storage: new LibSQLStore({
    url: ":memory:", // 本番では file:./mastra.db
  }),
  telemetry: {
    serviceName: "voice2issue",
    enabled: true,
  },
});
        