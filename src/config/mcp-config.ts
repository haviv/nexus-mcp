import { createOpenAI } from '@ai-sdk/openai';

// ── LLM Provider Presets ─────────────────────────────────────────────
// Switch providers by setting LLM_PROVIDER in .env (default: "ollama-qwen")
// Override the model within a provider with LLM_MODEL in .env
const llmProviders = {
    'openai-gpt5': {
        baseURL: 'https://api.openai.com/v1',
        apiKey: process.env.OPENAI_API_KEY || '',
        model: 'gpt-5.2',
    },
    'openai-gpt4o': {
        baseURL: 'https://api.openai.com/v1',
        apiKey: process.env.OPENAI_API_KEY || '',
        model: 'gpt-4o',
    },
    'ollama-qwen': {
        baseURL: 'https://llm.azure-np.pathlockgrc.com/v1',
        apiKey: 'ollama',
        model: 'qwen2.5:7b',
    },
    'ollama-gpt-oss': {
        baseURL: 'https://llm.azure-np.pathlockgrc.com/v1',
        apiKey: 'ollama',
        model: 'gpt-oss:latest',
    },
    'ollama-gpt-oss-120b': {
        baseURL: 'https://llm.azure-np.pathlockgrc.com/v1',
        apiKey: 'ollama',
        model: 'gpt-oss:120b',
    },
    // OpenRouter - OpenAI Models (supports tools)
    'openrouter-gpt5.3': {
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY || '',
        model: 'openai/gpt-5.3-codex',
    },
    'openrouter-gpt-oss-120b': {
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY || '',
        model: 'openai/gpt-oss-120b',
    },
    // OpenRouter - MiniMax (supports tools)
    'openrouter-minimax': {
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY || '',
        model: 'minimax/minimax-m2.5',
    },
    // OpenRouter - Qwen Models (supports tools)
    'openrouter-qwen-72b': {
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY || '',
        model: 'qwen/qwen-2.5-72b-instruct',
    },
    'openrouter-qwen-coder-32b': {
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY || '',
        model: 'qwen/qwen-2.5-coder-32b-instruct',
    },
    // OpenRouter - DeepSeek (supports tools)
    'openrouter-deepseek-chat': {
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY || '',
        model: 'deepseek/deepseek-chat',
    },
    // OpenRouter - Google Gemini (supports tools)
    'openrouter-gemini-flash': {
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY || '',
        model: 'google/gemini-flash-1.5',
    },
    // OpenRouter - Anthropic Claude (supports tools)
    'openrouter-claude-sonnet': {
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY || '',
        model: 'anthropic/claude-3.5-sonnet',
    },
} as const;

type LLMProviderKey = keyof typeof llmProviders;

const activeKey = (process.env.LLM_PROVIDER || 'openai-gpt5') as LLMProviderKey;
const activeProvider = llmProviders[activeKey] ?? llmProviders['ollama-qwen'];

const llmClient = createOpenAI({
    baseURL: activeProvider.baseURL,
    apiKey: activeProvider.apiKey,
});

const llmModelName = process.env.LLM_MODEL || activeProvider.model;

export const llmModel = llmClient.chat(llmModelName);

export const llmInfo = {
    provider: activeKey,
    model: llmModelName,
    baseURL: activeProvider.baseURL,
};

// ── MCP & App Config ─────────────────────────────────────────────────
export const mcpConfig = {
    mssql: {
        command: process.env.MCP_SQL_COMMAND || '/path/to/MssqlMcp',
        args: [] as string[],
        env: {
            CONNECTION_STRING: process.env.MCP_CONNECTION_STRING || "",
            LOGGING__LOGLEVEL__DEFAULT: "Error",
            LOGGING__LOGLEVEL__MICROSOFT: "Error",
            LOGGING__LOGLEVEL__SYSTEM: "Error",
            LOGGING__LOGLEVEL__MODELCONTEXTPROTOCOL: "Error"
        }
    },
    gitbook: {
        url: process.env.GITBOOK_MCP_URL || 'https://help.pathlock.com/pathlock-cloud-documentation/~gitbook/mcp',
        signingKey: process.env.GITBOOK_SIGNING_KEY || '',
        spaceId: process.env.GITBOOK_SPACE_ID || '6fc3d2cd8883fb2297b19f00e2a78bb16bfa8f95',
    },
    clickhouse: {
        command: 'node',
        args: [process.env.CLICKHOUSE_MCP_PATH || '/Users/havivrosh/work/ai/clickhouse-mcp-server/dist/index.js'],
        env: {
            CLICKHOUSE_HOST: process.env.CLICKHOUSE_HOST || 'http://localhost:8123',
            CLICKHOUSE_USERNAME: process.env.CLICKHOUSE_USERNAME || 'default',
            CLICKHOUSE_PASSWORD: process.env.CLICKHOUSE_PASSWORD || '',
            CLICKHOUSE_DATABASE: process.env.CLICKHOUSE_DATABASE || 'default',
        }
    },
    workflow: {
        command: 'node',
        args: [process.env.WORKFLOW_MCP_PATH || '/Users/havivrosh/work/ai/mcp_nexus/scripts/workflow-mcp-server.js'],
        env: {
            WORKFLOW_API_URL: process.env.NEXUS_API_URL || 'http://localhost:5000',
            WORKFLOW_API_TOKEN: process.env.NEXUS_API_TOKEN || '',
        }
    },
    nexus: {
        url: process.env.MCP_NEXUS_URL || 'http://localhost:3000/mcp-nexus/server'
    },
    settings: {
        maxSteps: 20
    }
};
