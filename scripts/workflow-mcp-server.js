#!/usr/bin/env node

/**
 * Workflow MCP Server — stdio-based MCP server for the Pathlock Workflow Engine.
 *
 * Env vars:
 *   WORKFLOW_API_URL   — Base URL of the workflow API (e.g. http://localhost:5000)
 *   WORKFLOW_API_TOKEN — Optional Bearer token for authentication
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

const API_URL = (process.env.WORKFLOW_API_URL || "http://localhost:5000").replace(/\/$/, "");
const API_TOKEN = process.env.WORKFLOW_API_TOKEN || "";

function headers(extra) {
  const h = { "Content-Type": "application/json" };
  if (API_TOKEN) h["Authorization"] = `Bearer ${API_TOKEN}`;
  return { ...h, ...extra };
}

async function api(method, path, body) {
  const url = `${API_URL}${path}`;
  const opts = { method, headers: headers() };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { status: res.status, body: text };
  }
}

// ── Tool definitions ─────────────────────────────────────────────────
const TOOLS = [
  {
    name: "list_workflows",
    description: "List all workflow definitions",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_workflow",
    description: "Get a specific workflow definition by ID",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Workflow definition ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "create_workflow",
    description: "Create a new workflow definition",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Workflow name" },
        description: { type: "string", description: "Workflow description" },
        definition: { type: "string", description: "Workflow definition as a JSON string" },
        createdBy: { type: "string", description: "Creator username" },
      },
      required: ["name", "definition"],
    },
  },
  {
    name: "update_workflow",
    description: "Update an existing workflow definition. ONLY works on Draft status definitions. For Active workflows, use save_draft instead, then promote_draft.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Workflow definition ID" },
        name: { type: "string", description: "New workflow name" },
        description: { type: "string", description: "New description" },
        definition: { type: "string", description: "Updated workflow definition as a JSON string" },
      },
      required: ["id"],
    },
  },
  {
    name: "publish_workflow",
    description: "Publish a workflow definition so it can be triggered",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Workflow definition ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_workflow",
    description: "Delete a workflow definition",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Workflow definition ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "test_workflow",
    description: "Test-run a Draft workflow definition without promoting it. The 'inputs' parameter is a flat JSON string whose keys match the workflow's declared input names, e.g. '{\"userName\":\"Alice\"}'.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Workflow definition ID" },
        inputs: { type: "string", description: "Workflow input values as a flat JSON string, e.g. '{\"userName\":\"Alice\"}'. Keys must match the workflow's declared input names." },
        definition: { type: "string", description: "Optional override definition as a JSON string" },
      },
      required: ["id", "inputs"],
    },
  },
  {
    name: "trigger_workflow",
    description: "Trigger (run) a published (Active) workflow by definition ID. The 'inputs' parameter is a flat JSON string whose keys match the workflow's declared input names, e.g. '{\"userName\":\"Alice\"}'.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Workflow definition ID" },
        inputs: { type: "string", description: "Workflow input values as a flat JSON string, e.g. '{\"userName\":\"Alice\"}'. Keys must match the workflow's declared input names." },
      },
      required: ["id"],
    },
  },
  {
    name: "get_instance",
    description: "Get the status of a running workflow instance",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Workflow instance ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "get_instance_logs",
    description: "Get execution logs for a workflow instance",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Workflow instance ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "list_action_definitions",
    description: "List all available workflow action definitions. Returns the built-in action catalog with id, category, slug, display name, version, runtime, class, and description.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "save_draft",
    description: "Save a draft on an Active workflow definition. Use this to modify an already-published workflow without disrupting the running version. After saving a draft, test it with test_workflow, then promote it with promote_draft.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Workflow definition ID" },
        definition: { type: "string", description: "Updated workflow definition as a JSON string" },
        description: { type: "string", description: "Optional updated description" },
      },
      required: ["id", "definition"],
    },
  },
  {
    name: "promote_draft",
    description: "Promote a saved draft to become the new active version (bumps the version number). The workflow must have a pending draft saved via save_draft.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Workflow definition ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "discard_draft",
    description: "Discard a pending draft on a workflow definition, keeping the current active version unchanged.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Workflow definition ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "deactivate_workflow",
    description: "Deactivate an Active workflow definition. Disables schedules. Cannot be triggered while inactive.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Workflow definition ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "activate_workflow",
    description: "Reactivate an Inactive workflow definition back to Active.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Workflow definition ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "trigger_workflow_by_name",
    description: "Trigger (run) a published workflow by its name instead of ID. The 'inputs' parameter is a flat JSON string whose keys match the workflow's declared input names.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Workflow definition name" },
        inputs: { type: "string", description: "Workflow input values as a flat JSON string." },
      },
      required: ["name"],
    },
  },
  {
    name: "list_instances",
    description: "List workflow instances, optionally filtered by status and/or definition ID.",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", description: "Filter by status: Running, Completed, Failed, Cancelled" },
        definitionId: { type: "string", description: "Filter by workflow definition ID" },
      },
    },
  },
  {
    name: "get_instance_context",
    description: "Get the full execution context for a workflow instance, including all resolved inputs, step outputs, and variables.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Workflow instance ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "cancel_instance",
    description: "Cancel a running workflow instance.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Workflow instance ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "get_workflow_history",
    description: "Get the change history (audit trail) for a workflow definition.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Workflow definition ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "revert_workflow",
    description: "Revert a workflow definition to a historical version. The reverted version is saved as a draft for review before promoting.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Workflow definition ID" },
        changeId: { type: "number", description: "The change ID from the history to revert to" },
      },
      required: ["id", "changeId"],
    },
  },
  {
    name: "generate_webhook",
    description: "Generate a webhook token for an Active workflow definition. Returns the token and webhook URL.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Workflow definition ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "revoke_webhook",
    description: "Revoke the webhook token for a workflow definition.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Workflow definition ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "set_schedule",
    description: "Set a cron schedule on an Active workflow definition.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Workflow definition ID" },
        cronExpression: { type: "string", description: "Cron expression, e.g. '0 0 * * *' for daily at midnight" },
      },
      required: ["id", "cronExpression"],
    },
  },
  {
    name: "disable_schedule",
    description: "Disable the cron schedule for a workflow definition.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Workflow definition ID" },
      },
      required: ["id"],
    },
  },
];

// ── Tool handlers ────────────────────────────────────────────────────
async function handleTool(name, args) {
  switch (name) {
    case "list_workflows":
      return api("GET", "/api/v1/wf/definitions");

    case "get_workflow":
      return api("GET", `/api/v1/wf/definitions/${encodeURIComponent(args.id)}`);

    case "create_workflow": {
      const body = {
        name: args.name,
        description: args.description,
        definition: JSON.parse(args.definition),
        createdBy: args.createdBy,
      };
      return api("POST", "/api/v1/wf/definitions", body);
    }

    case "update_workflow": {
      const payload = {};
      if (args.name) payload.name = args.name;
      if (args.description) payload.description = args.description;
      if (args.definition) payload.definition = JSON.parse(args.definition);
      return api("PUT", `/api/v1/wf/definitions/${encodeURIComponent(args.id)}`, payload);
    }

    case "publish_workflow":
      return api("POST", `/api/v1/wf/definitions/${encodeURIComponent(args.id)}/publish`);

    case "delete_workflow": {
      const url = `${API_URL}/api/v1/wf/definitions/${encodeURIComponent(args.id)}`;
      const res = await fetch(url, { method: "DELETE", headers: headers() });
      return res.ok ? { success: true } : { success: false, status: res.status };
    }

    case "test_workflow": {
      const body = { inputs: JSON.parse(args.inputs) };
      if (args.definition) body.definition = JSON.parse(args.definition);
      return api("POST", `/api/v1/wf/trigger/${encodeURIComponent(args.id)}/test`, body);
    }

    case "trigger_workflow": {
      const body = args.inputs ? { inputs: JSON.parse(args.inputs) } : {};
      return api("POST", `/api/v1/wf/trigger/${encodeURIComponent(args.id)}/run`, body);
    }

    case "get_instance":
      return api("GET", `/api/v1/wf/instances/${encodeURIComponent(args.id)}`);

    case "get_instance_logs":
      return api("GET", `/api/v1/wf/instances/${encodeURIComponent(args.id)}/logs`);

    case "list_action_definitions":
      return api("GET", "/api/v1/wf/definitions/actions");

    case "save_draft": {
      const payload = { definition: JSON.parse(args.definition) };
      if (args.description) payload.description = args.description;
      return api("PUT", `/api/v1/wf/definitions/${encodeURIComponent(args.id)}/draft`, payload);
    }

    case "promote_draft":
      return api("POST", `/api/v1/wf/definitions/${encodeURIComponent(args.id)}/promote`);

    case "discard_draft": {
      const url = `${API_URL}/api/v1/wf/definitions/${encodeURIComponent(args.id)}/draft`;
      const res = await fetch(url, { method: "DELETE", headers: headers() });
      return res.ok ? { success: true } : { success: false, status: res.status };
    }

    case "deactivate_workflow":
      return api("POST", `/api/v1/wf/definitions/${encodeURIComponent(args.id)}/deactivate`);

    case "activate_workflow":
      return api("POST", `/api/v1/wf/definitions/${encodeURIComponent(args.id)}/activate`);

    case "trigger_workflow_by_name": {
      const body = args.inputs ? { inputs: JSON.parse(args.inputs) } : {};
      return api("POST", `/api/v1/wf/trigger/by-name/${encodeURIComponent(args.name)}/run`, body);
    }

    case "list_instances": {
      const params = new URLSearchParams();
      if (args.status) params.set("status", args.status);
      if (args.definitionId) params.set("definitionId", args.definitionId);
      const qs = params.toString();
      return api("GET", `/api/v1/wf/instances${qs ? '?' + qs : ''}`);
    }

    case "get_instance_context":
      return api("GET", `/api/v1/wf/instances/${encodeURIComponent(args.id)}/context`);

    case "cancel_instance":
      return api("POST", `/api/v1/wf/instances/${encodeURIComponent(args.id)}/cancel`);

    case "get_workflow_history":
      return api("GET", `/api/v1/wf/definitions/${encodeURIComponent(args.id)}/history`);

    case "revert_workflow":
      return api("POST", `/api/v1/wf/definitions/${encodeURIComponent(args.id)}/revert`, { changeId: args.changeId });

    case "generate_webhook":
      return api("POST", `/api/v1/wf/definitions/${encodeURIComponent(args.id)}/webhook`);

    case "revoke_webhook": {
      const url = `${API_URL}/api/v1/wf/definitions/${encodeURIComponent(args.id)}/webhook`;
      const res = await fetch(url, { method: "DELETE", headers: headers() });
      return res.ok ? { success: true } : { success: false, status: res.status };
    }

    case "set_schedule":
      return api("POST", `/api/v1/wf/definitions/${encodeURIComponent(args.id)}/schedule`, { cronExpression: args.cronExpression });

    case "disable_schedule": {
      const url = `${API_URL}/api/v1/wf/definitions/${encodeURIComponent(args.id)}/schedule`;
      const res = await fetch(url, { method: "DELETE", headers: headers() });
      return res.ok ? { success: true } : { success: false, status: res.status };
    }

    default:
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
  }
}

// ── Server setup ─────────────────────────────────────────────────────
const server = new Server(
  { name: "workflow-mcp-server", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    const result = await handleTool(name, args || {});
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Workflow operation failed: ${error.message}`
    );
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Workflow MCP server running on stdio");
