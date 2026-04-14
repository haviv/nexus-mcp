import { createOpenAI } from '@ai-sdk/openai';

type AccessTokenCache = {
    token: string;
    expiresAt: number;
};

let cachedAzureAccessToken: AccessTokenCache | null = null;

async function getAzureClientCredentialsAccessToken(): Promise<string> {
    const now = Date.now();
    if (cachedAzureAccessToken && now < cachedAzureAccessToken.expiresAt - 60_000) {
        return cachedAzureAccessToken.token;
    }

    const tenantId = process.env.OLLAMA_AAD_TENANT_ID || '';
    const clientId = process.env.OLLAMA_AAD_CLIENT_ID || '';
    const clientSecret = process.env.OLLAMA_AAD_CLIENT_SECRET || '';
    const scope = process.env.OLLAMA_AAD_SCOPE || '';

    if (!tenantId || !clientId || !clientSecret || !scope) {
        throw new Error(
            'Missing Azure AD credentials. Please set OLLAMA_AAD_TENANT_ID, OLLAMA_AAD_CLIENT_ID, OLLAMA_AAD_CLIENT_SECRET, and OLLAMA_AAD_SCOPE.'
        );
    }

    const tokenUrl =
        process.env.OLLAMA_AAD_TOKEN_URL ||
        `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    const body = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope,
        grant_type: 'client_credentials',
    });

    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
    });

    if (!response.ok) {
        const details = await response.text();
        throw new Error(`Azure AD token request failed (${response.status}): ${details.slice(0, 500)}`);
    }

    const data = (await response.json()) as {
        access_token?: string;
        expires_in?: number;
    };

    if (!data.access_token) {
        throw new Error('Azure AD token response did not include access_token.');
    }

    const expiresInSeconds = typeof data.expires_in === 'number' ? data.expires_in : 3600;
    cachedAzureAccessToken = {
        token: data.access_token,
        expiresAt: Date.now() + expiresInSeconds * 1000,
    };

    return data.access_token;
}

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
        baseURL: 'https://llm-agent.azure-np.pathlockgrc.com/v1',
        apiKey: 'ollama',
        model: 'gpt-oss:latest',
    },
    'ollama-gpt-oss-120b': {
        baseURL: 'https://llm-agent.azure-np.pathlockgrc.com/v1',
        apiKey: 'ollama',
        model: 'gpt-oss:120b',
    },
    'ollama-gpt-gemma4:26b': {
        baseURL: 'https://llm-agent.azure-np.pathlockgrc.com/v1',
        apiKey: 'ollama',
        model: 'gemma4:26b-a4b-it-q8_0',
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
    'openrouter-gemma-4-31b-it': {
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY || '',
        model: 'google/gemma-4-31b-it',
    },

    'openrouter-gemma-4-26b-a4b-it': {
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY || '',
        model: 'google/gemma-4-26b-a4b-it',
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


// use useAzureAdAuth in case it starts with ollama-
const useAzureAdAuth = activeKey.startsWith('ollama-');

const providerFetch = useAzureAdAuth
    ? async (input: RequestInfo | URL, init?: RequestInit) => {
        const token = await getAzureClientCredentialsAccessToken();
        const headers = new Headers(init?.headers);
        headers.set('Authorization', `Bearer ${token}`);
        return fetch(input, {
            ...init,
            headers,
        });
    }
    : undefined;

const llmClient = createOpenAI({
    baseURL: activeProvider.baseURL,
    apiKey: activeProvider.apiKey,
    fetch: providerFetch,
});

const llmModelName = process.env.LLM_MODEL || activeProvider.model;

export const llmModel: ReturnType<typeof llmClient.chat> = llmClient.chat(llmModelName);

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
