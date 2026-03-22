import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import {
    convertToModelMessages,
    experimental_createMCPClient,
    stepCountIs,
    streamText,
} from 'ai';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { mcpConfig, llmModel, llmInfo } from './config/mcp-config.js';
import { systemPrompts } from './config/system-prompts.js';

const PORT = process.env.PORT || 5000;

// Track last logged message to prevent duplicates
let lastLoggedMessage = '';

// Logging function for user prompts - only log the most recent user message
function logUserPrompt(messages: any[], timestamp: string = new Date().toISOString()) {
    try {
        const logsDir = '/app/logs';
        const logFile = path.join(logsDir, `user-prompts-${new Date().toISOString().split('T')[0]}.log`);

        // Ensure logs directory exists
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }

        // Extract only the most recent user message (the new query)
        const userMessages = messages.filter((msg: any) => msg.role === 'user');
        const latestUserMessage = userMessages[userMessages.length - 1];

        if (!latestUserMessage) {
            console.log('No user message found to log');
            return;
        }

        const messageContent = latestUserMessage.content || (latestUserMessage.parts ? latestUserMessage.parts.map((p: any) => p.text).join('') : '');

        // Check if this message was already logged to prevent duplicates
        if (lastLoggedMessage === messageContent) {
            console.log('📝 Skipping duplicate message log');
            return;
        }

        const logEntry = {
            timestamp,
            userMessage: {
                content: messageContent,
                timestamp: latestUserMessage.timestamp || timestamp
            }
        };

        // Update the last logged message
        lastLoggedMessage = messageContent;

        // Append to log file
        fs.appendFileSync(logFile, JSON.stringify(logEntry, null, 2) + '\n---\n');
        console.log(`📝 Logged user query: "${logEntry.userMessage.content.substring(0, 50)}..." to: ${logFile}`);
    } catch (error) {
        console.error('Error logging user prompt:', error);
    }
}

// Log all environment variables for debugging
console.log('=== ALL ENVIRONMENT VARIABLES ===');
Object.keys(process.env).sort().forEach(key => {
    if (key.includes('ADMIN') || key.includes('MCP') || key.includes('PORT') || key.includes('JWT') || key.includes('LLM')) {
        console.log(`${key}: ${process.env[key]}`);
    }
});
console.log('================================\n');

// Log MCP configuration at startup
console.log('=== MCP CONFIGURATION ===');
console.log('LLM_PROVIDER:', llmInfo.provider);
console.log('LLM_MODEL:', llmInfo.model);
console.log('LLM_BASE_URL:', llmInfo.baseURL);
console.log('MCP_SQL_COMMAND:', process.env.MCP_SQL_COMMAND || mcpConfig.mssql.command);
console.log('MCP_CONNECTION_STRING:', process.env.MCP_CONNECTION_STRING);
console.log('GITBOOK_MCP_URL:', mcpConfig.gitbook.url);
console.log('GITBOOK_SIGNING_KEY:', mcpConfig.gitbook.signingKey ? '***set***' : 'NOT SET');
console.log('CLICKHOUSE_HOST:', mcpConfig.clickhouse.env.CLICKHOUSE_HOST);
console.log('CLICKHOUSE_DATABASE:', mcpConfig.clickhouse.env.CLICKHOUSE_DATABASE);
console.log('WORKFLOW_MCP_PATH:', mcpConfig.workflow.args[0]);
console.log('WORKFLOW_API_URL:', mcpConfig.workflow.env.WORKFLOW_API_URL);
console.log('WORKFLOW_API_TOKEN:', mcpConfig.workflow.env.WORKFLOW_API_TOKEN ? '***set***' : 'NOT SET');
console.log('MAX_STEPS:', mcpConfig.settings.maxSteps);
console.log('========================\n');

// Generate a signed JWT for GitBook visitor authentication
function generateGitBookJWT(): string {
    if (!mcpConfig.gitbook.signingKey) {
        console.warn('GITBOOK_SIGNING_KEY not set — GitBook MCP will be skipped');
        return '';
    }
    return jwt.sign({}, mcpConfig.gitbook.signingKey, { expiresIn: '1h' });
}

// Build the cookie value GitBook expects after the ?jwt_token redirect flow
function buildGitBookCookie(token: string): string {
    const payload = JSON.stringify({
        basePath: '/pathlock-cloud-documentation/',
        token,
    });
    return `gitbook-visitor-token~${mcpConfig.gitbook.spaceId}=${encodeURIComponent(payload)}`;
}

// Shared helper: prepare messages for LLM (last 20, truncate assistant)
function prepareMessages(messages: any[]) {
    const messagesToSend = messages.slice(-20);
    return messagesToSend.map((message: any) => {
        if (message.role === 'assistant') {
            const truncatedMessage = { ...message };
            if (truncatedMessage.parts && Array.isArray(truncatedMessage.parts)) {
                truncatedMessage.parts = truncatedMessage.parts.map((part: any) => {
                    if (part.text && part.text.length > 500) {
                        return { ...part, text: part.text.substring(0, 500) + '...[truncated]' };
                    }
                    return part;
                });
            } else if (truncatedMessage.content && truncatedMessage.content.length > 500) {
                truncatedMessage.content = truncatedMessage.content.substring(0, 500) + '...[truncated]';
            }
            return truncatedMessage;
        }
        return message;
    });
}

// Shared helper: stream result back to response
function pipeStreamToResponse(result: any, res: any) {
    const webResponse = result.toUIMessageStreamResponse();
    const headers = Object.fromEntries(webResponse.headers.entries());
    res.writeHead(webResponse.status, headers as any);
    const webBody = webResponse.body as ReadableStream<Uint8Array> | null;
    if (!webBody) { res.end(); return; }
    const reader = webBody.getReader();
    (async () => {
        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                if (value) res.write(Buffer.from(value));
            }
            res.end();
        } catch (err) {
            console.error('Error streaming response:', err);
            res.destroy(err as Error);
        }
    })();
}

createServer(async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const url = new URL(req.url || '', `http://localhost:${PORT}`);

    switch (url.pathname) {
        case '/auth/login': {
            if (req.method !== 'POST') {
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Method not allowed' }));
                return;
            }
            let body = '';
            req.on('data', chunk => (body += chunk.toString()));
            req.on('end', async () => {
                try {
                    const { username, password } = JSON.parse(body || '{}');
                    const adminUser = process.env.ADMIN_USERNAME || 'admin';
                    const adminHash = process.env.ADMIN_PASSWORD_HASH || '';

                    // Debug environment variables
                    console.log('=== LOGIN DEBUG ===');
                    console.log('ADMIN_USERNAME from env:', process.env.ADMIN_USERNAME);
                    console.log('ADMIN_PASSWORD_HASH from env:', process.env.ADMIN_PASSWORD_HASH);
                    console.log('adminUser:', adminUser);
                    console.log('adminHash:', adminHash);
                    console.log('adminHash length:', adminHash.length);
                    console.log('password:', password);
                    console.log('bcrypt compare result:', bcrypt.compareSync(password || '', adminHash));
                    console.log('==================');

                    if (username !== adminUser) {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid credentials' }));
                        return;
                    }
                    if (!adminHash || !bcrypt.compareSync(password || '', adminHash)) {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid credentials' }));
                        return;
                    }
                    const token = jwt.sign({ sub: username, role: 'admin' }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ token }));
                } catch (e) {
                    console.error('Error logging in:', e);
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Bad request' }));
                }
            });
            break;
        }
        case '/mcp-nexus/chat': {
            if (req.method !== 'POST') {
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Method not allowed' }));
                return;
            }

            try {
                // Require auth
                const auth = req.headers['authorization'] || '';
                const token = auth.startsWith('Bearer ')
                    ? auth.substring('Bearer '.length)
                    : '';
                try {
                    jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
                } catch (error) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        error: 'Token expired or invalid',
                        code: 'TOKEN_EXPIRED',
                        redirectToLogin: true
                    }));
                    return;
                }
                // Parse request body
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });

                req.on('end', async () => {
                    try {
                        const { messages } = JSON.parse(body);
                        logUserPrompt(messages);

                        const mssqlMcpClient = await experimental_createMCPClient({
                            transport: new StdioClientTransport({
                                command: mcpConfig.mssql.command,
                                args: mcpConfig.mssql.args,
                                env: mcpConfig.mssql.env,
                            }),
                        });
                        const tools = await mssqlMcpClient.tools();
                        console.log("MSSQL MCP connected — tools:", Object.keys(tools));

                        const processedMessages = prepareMessages(messages);
                        console.log(`Processing ${messages.length} messages → ${processedMessages.length} sent`);

                        const result = streamText({
                            model: llmModel,
                            stopWhen: stepCountIs(mcpConfig.settings.maxSteps),
                            tools,
                            onStepFinish: async ({ toolResults }) => {
                                console.log(`STEP RESULTS: ${JSON.stringify(toolResults, null, 2)}`);
                            },
                            system: `Today's date is ${new Date().toISOString().split('T')[0]}.

${systemPrompts.grcAssistant}`,
                            messages: convertToModelMessages(processedMessages),
                            onFinish: async () => {
                                await mssqlMcpClient.close();
                            },
                        });

                        pipeStreamToResponse(result, res);
                    } catch (error) {
                        console.error('Error processing chat request:', error);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Internal server error' }));
                    }
                });
            } catch (error) {
                console.error('Error setting up chat handler:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal server error' }));
            }
            break;
        }

        case '/mcp-nexus/chat-docs': {
            if (req.method !== 'POST') {
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Method not allowed' }));
                return;
            }
            try {
                const auth = req.headers['authorization'] || '';
                const token = auth.startsWith('Bearer ') ? auth.substring('Bearer '.length) : '';
                try {
                    jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
                } catch {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Token expired or invalid', code: 'TOKEN_EXPIRED', redirectToLogin: true }));
                    return;
                }
                let body = '';
                req.on('data', chunk => { body += chunk.toString(); });
                req.on('end', async () => {
                    try {
                        const { messages } = JSON.parse(body);
                        logUserPrompt(messages);

                        let gitbookMcpClient: Awaited<ReturnType<typeof experimental_createMCPClient>> | null = null;
                        let tools: Record<string, any> = {};
                        if (mcpConfig.gitbook.signingKey) {
                            try {
                                const cookie = buildGitBookCookie(generateGitBookJWT());
                                gitbookMcpClient = await experimental_createMCPClient({
                                    transport: new StreamableHTTPClientTransport(
                                        new URL(mcpConfig.gitbook.url),
                                        { requestInit: { headers: { Cookie: cookie } } },
                                    ),
                                });
                                tools = await gitbookMcpClient.tools();
                                console.log("GitBook MCP connected — tools:", Object.keys(tools));
                            } catch (err) {
                                console.error("Failed to connect GitBook MCP:", err);
                            }
                        } else {
                            console.warn('GITBOOK_SIGNING_KEY not set — docs mode has no tools');
                        }

                        const processedMessages = prepareMessages(messages);
                        const result = streamText({
                            model: llmModel,
                            stopWhen: stepCountIs(mcpConfig.settings.maxSteps),
                            tools,
                            onStepFinish: async ({ toolResults }) => {
                                console.log(`DOCS STEP: ${JSON.stringify(toolResults, null, 2)}`);
                            },
                            system: `Today's date is ${new Date().toISOString().split('T')[0]}.

${systemPrompts.docsAssistant}`,
                            messages: convertToModelMessages(processedMessages),
                            onFinish: async () => {
                                if (gitbookMcpClient) await gitbookMcpClient.close().catch(() => {});
                            },
                        });
                        pipeStreamToResponse(result, res);
                    } catch (error) {
                        console.error('Error in chat-docs:', error);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Internal server error' }));
                    }
                });
            } catch (error) {
                console.error('Error setting up chat-docs handler:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal server error' }));
            }
            break;
        }

        case '/mcp-nexus/chat-analytics': {
            if (req.method !== 'POST') {
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Method not allowed' }));
                return;
            }
            try {
                const auth = req.headers['authorization'] || '';
                const token = auth.startsWith('Bearer ') ? auth.substring('Bearer '.length) : '';
                try {
                    jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
                } catch {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Token expired or invalid', code: 'TOKEN_EXPIRED', redirectToLogin: true }));
                    return;
                }
                let body = '';
                req.on('data', chunk => { body += chunk.toString(); });
                req.on('end', async () => {
                    try {
                        const { messages } = JSON.parse(body);
                        logUserPrompt(messages);

                        // Connect SQL Server
                        const mssqlMcpClient = await experimental_createMCPClient({
                            transport: new StdioClientTransport({
                                command: mcpConfig.mssql.command,
                                args: mcpConfig.mssql.args,
                                env: mcpConfig.mssql.env,
                            }),
                        });
                        const mssqlTools = await mssqlMcpClient.tools();
                        console.log("MSSQL MCP connected — tools:", Object.keys(mssqlTools));

                        // Connect ClickHouse
                        let clickhouseMcpClient: Awaited<ReturnType<typeof experimental_createMCPClient>> | null = null;
                        let clickhouseTools: Record<string, any> = {};
                        try {
                            clickhouseMcpClient = await experimental_createMCPClient({
                                transport: new StdioClientTransport({
                                    command: mcpConfig.clickhouse.command,
                                    args: mcpConfig.clickhouse.args,
                                    env: mcpConfig.clickhouse.env,
                                }),
                            });
                            clickhouseTools = await clickhouseMcpClient.tools();
                            console.log("ClickHouse MCP connected — tools:", Object.keys(clickhouseTools));
                        } catch (err) {
                            console.error("Failed to connect ClickHouse MCP (continuing without it):", err);
                        }

                        const tools = { ...mssqlTools, ...clickhouseTools };
                        const processedMessages = prepareMessages(messages);
                        const result = streamText({
                            model: llmModel,
                            stopWhen: stepCountIs(mcpConfig.settings.maxSteps),
                            tools,
                            onStepFinish: async ({ toolResults }) => {
                                console.log(`ANALYTICS STEP: ${JSON.stringify(toolResults, null, 2)}`);
                            },
                            system: `Today's date is ${new Date().toISOString().split('T')[0]}. All date references in queries should use this year unless the user explicitly specifies otherwise.\n\n${systemPrompts.analyticsAssistant}`,
                            messages: convertToModelMessages(processedMessages),
                            onFinish: async () => {
                                await mssqlMcpClient.close();
                                if (clickhouseMcpClient) await clickhouseMcpClient.close().catch(() => {});
                            },
                        });
                        pipeStreamToResponse(result, res);
                    } catch (error) {
                        console.error('Error in chat-analytics:', error);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Internal server error' }));
                    }
                });
            } catch (error) {
                console.error('Error setting up chat-analytics handler:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal server error' }));
            }
            break;
        }

        case '/mcp-nexus/chat-workflow': {
            if (req.method !== 'POST') {
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Method not allowed' }));
                return;
            }
            try {
                const auth = req.headers['authorization'] || '';
                const token = auth.startsWith('Bearer ') ? auth.substring('Bearer '.length) : '';
                try {
                    jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
                } catch {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Token expired or invalid', code: 'TOKEN_EXPIRED', redirectToLogin: true }));
                    return;
                }
                let body = '';
                req.on('data', chunk => { body += chunk.toString(); });
                req.on('end', async () => {
                    try {
                        const { messages } = JSON.parse(body);
                        logUserPrompt(messages);

                        // Connect Workflow MCP (stdio, same pattern as ClickHouse)
                        const workflowMcpClient = await experimental_createMCPClient({
                            transport: new StdioClientTransport({
                                command: mcpConfig.workflow.command,
                                args: mcpConfig.workflow.args,
                                env: mcpConfig.workflow.env,
                            }),
                        });
                        const tools = await workflowMcpClient.tools();
                        console.log("Workflow MCP connected — tools:", Object.keys(tools));

                        const processedMessages = prepareMessages(messages);
                        const result = streamText({
                            model: llmModel,
                            stopWhen: stepCountIs(mcpConfig.settings.maxSteps),
                            tools,
                            onStepFinish: async ({ toolResults }) => {
                                console.log(`WORKFLOW STEP: ${JSON.stringify(toolResults, null, 2)}`);
                            },
                            system: `Today's date is ${new Date().toISOString().split('T')[0]}.\n\n${systemPrompts.workflowAssistant}`,
                            messages: convertToModelMessages(processedMessages),
                            onFinish: async () => {
                                await workflowMcpClient.close();
                            },
                        });
                        pipeStreamToResponse(result, res);
                    } catch (error) {
                        console.error('Error in chat-workflow:', error);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Internal server error' }));
                    }
                });
            } catch (error) {
                console.error('Error setting up chat-workflow handler:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal server error' }));
            }
            break;
        }

        case '/mcp-nexus/server': {
            if (req.method !== 'POST') {
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    jsonrpc: '2.0',
                    error: {
                        code: -32000,
                        message: 'Method not allowed.',
                    },
                    id: null,
                }));
                return;
            }

            // Handle MCP server requests
            try {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });

                req.on('end', async () => {
                    try {
                        // For now, return a simple response for MCP server requests
                        // This would need to be implemented based on your specific MCP server needs
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            jsonrpc: '2.0',
                            result: { message: 'MCP server endpoint active' },
                            id: null,
                        }));
                    } catch (error) {
                        console.error('Error processing MCP server request:', error);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            jsonrpc: '2.0',
                            error: {
                                code: -32603,
                                message: 'Internal error',
                            },
                            id: null,
                        }));
                    }
                });
            } catch (error) {
                console.error('Error setting up MCP server handler:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    jsonrpc: '2.0',
                    error: {
                        code: -32603,
                        message: 'Internal error',
                    },
                    id: null,
                }));
            }
            break;
        }

        case '/health': {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
            break;
        }

        default: {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not found' }));
        }
    }
}).listen(PORT, () => {
    console.log(`🚀 MCP Nexus Node.js server running on port ${PORT}`);
    console.log(`📡 GRC Chat:       http://localhost:${PORT}/mcp-nexus/chat`);
    console.log(`📚 Docs Chat:      http://localhost:${PORT}/mcp-nexus/chat-docs`);
    console.log(`📊 Analytics Chat: http://localhost:${PORT}/mcp-nexus/chat-analytics`);
    console.log(`⚙️  Workflow Chat:  http://localhost:${PORT}/mcp-nexus/chat-workflow`);
    console.log(`🔧 MCP Server:     http://localhost:${PORT}/mcp-nexus/server`);
    console.log(`❤️  Health:         http://localhost:${PORT}/health`);
});
