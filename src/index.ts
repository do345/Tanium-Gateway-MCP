#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { assetTools } from "./tools/asset.js";
import { complyTools } from "./tools/comply.js";
import { deployTools } from "./tools/deploy.js";
import { discoverTools } from "./tools/discover.js";
import { integrityMonitorTools } from "./tools/integrityMonitor.js";
import { patchTools } from "./tools/patch.js";
import { reportingTools } from "./tools/reporting.js";
import { threatResponseTools } from "./tools/threatResponse.js";

import { RESOURCES, readResourceContent } from "./resources.js";
import { PROMPTS, buildPromptMessages } from "./prompts.js";

type McpTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, unknown>) => Promise<unknown>;
};

const TOOLS: McpTool[] = [
  ...assetTools,
  ...complyTools,
  ...deployTools,
  ...discoverTools,
  ...integrityMonitorTools,
  ...patchTools,
  ...reportingTools,
  ...threatResponseTools,
] as McpTool[];

const server = new Server(
  { name: "tanium-gateway-mcp", version: "0.2.0" },
  { capabilities: { tools: {}, resources: {}, prompts: {}  } }
);

// ---------------------------------------------------------------------------
// Tools (기존)
// ---------------------------------------------------------------------------
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema,
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = TOOLS.find((t) => t.name === request.params.name);
  if (!tool) {
    throw new Error(`알 수 없는 Tool: ${request.params.name}`);
  }
  try {
    const result = await tool.handler(request.params.arguments ?? {});
    return {
      content: [
        { type: "text" as const, text: JSON.stringify(result, null, 2) },
      ],
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text" as const, text: `오류: ${message}` }],
      isError: true,
    };
  }
});

// ---------------------------------------------------------------------------
// Resources (신규)
// ---------------------------------------------------------------------------
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: RESOURCES.map((r) => ({
    uri: r.uri,
    name: r.name,
    description: r.description,
    mimeType: r.mimeType,
  })),
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  const text = readResourceContent(uri);
  return {
    contents: [{ uri, mimeType: "text/markdown", text }],
  };
});

// ---------------------------------------------------------------------------
// Prompts (신규)
// ---------------------------------------------------------------------------
server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: PROMPTS.map((p) => ({
    name: p.name,
    description: p.description,
    arguments: p.arguments,
  })),
}));

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const messages = buildPromptMessages(name, (args ?? {}) as Record<string, string>);
  return { messages };
});
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(
    `tanium-gateway-mcp: 대기 중 (Tool ${TOOLS.length}개, Resource ${RESOURCES.length}개, Prompt ${PROMPTS.length}개)`
  );
}

main().catch((err) => {
  console.error("치명적 오류:", err);
  process.exit(1);
});
