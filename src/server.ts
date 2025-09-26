import { openai } from '@ai-sdk/openai';
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
import 'dotenv/config';
import { mcpConfig } from './config/mcp-config.js';
import { systemPrompts } from './config/system-prompts.js';

const PORT = process.env.PORT || 3000;

// Log MCP configuration at startup
console.log('=== MCP CONFIGURATION ===');
console.log('MCP_SQL_COMMAND:', process.env.MCP_SQL_COMMAND || mcpConfig.mssql.command);
console.log('MCP_CONNECTION_STRING:', process.env.MCP_CONNECTION_STRING ? '***SET***' : 'NOT SET');
console.log('MCP_NEXUS_URL:', process.env.MCP_NEXUS_URL || mcpConfig.nexus.url);
console.log('MAX_STEPS:', mcpConfig.settings.maxSteps);
console.log('========================\n');

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
                    const token = jwt.sign({ sub: username, role: 'admin' }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '8h' });
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
                } catch {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Unauthorized' }));
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

                        // Set up MCP client for MSSQL
                        const mssqlStdioTransport = new StdioClientTransport({
                            command: mcpConfig.mssql.command,
                            args: mcpConfig.mssql.args,
                            env: mcpConfig.mssql.env,
                        });

                        const mssqlMcpClient = await experimental_createMCPClient({
                            transport: mssqlStdioTransport,
                        });

                        const tools = await mssqlMcpClient.tools();

                        // Print all messages for debugging context length issues
                        console.log('=== DEBUGGING CONTEXT LENGTH ===');
                        console.log('Total messages count:', messages.length);

                        // Filter to only user messages (questions) and take the most recent 20
                        const userMessages = messages.filter((msg: any) => msg.role === 'user');
                        const messagesToSend = userMessages.slice(-20); // Get last 20 user messages only

                        console.log('Total messages received:', messages.length);
                        console.log('Total user messages:', userMessages.length);
                        console.log('Sending only user questions (max 20 most recent)');
                        console.log('User messages to send:', messagesToSend.length);

                        let contentSize = 0;
                        messagesToSend.forEach((message: any) => {
                            if (message.parts && Array.isArray(message.parts)) {
                                message.parts.forEach((part: any) => {
                                    if (part.text) contentSize += part.text.length;
                                });
                            }
                        });

                        console.log('User messages size:', contentSize, 'characters');
                        console.log('System prompt size:', systemPrompts.grcAssistant.length, 'characters');
                        console.log('Total size:', contentSize + systemPrompts.grcAssistant.length, 'characters');
                        console.log('Estimated tokens:', Math.ceil((contentSize + systemPrompts.grcAssistant.length) / 4));
                        console.log('=== END DEBUG INFO ===\n');

                        const result = streamText({
                            model: openai('gpt-4o'),
                            stopWhen: stepCountIs(mcpConfig.settings.maxSteps),
                            tools,
                            onStepFinish: async ({ toolResults }) => {
                                console.log(`STEP RESULTS: ${JSON.stringify(toolResults, null, 2)}`);
                            },
                            system: systemPrompts.grcAssistant,
                            messages: convertToModelMessages(messagesToSend),
                            onFinish: async () => {
                                await mssqlMcpClient.close();
                            },
                        });

                        // Return a UI message stream response compatible with @ai-sdk/react
                        const webResponse = result.toUIMessageStreamResponse();
                        const headers = Object.fromEntries(webResponse.headers.entries());
                        res.writeHead(webResponse.status, headers as any);

                        const webBody = webResponse.body as ReadableStream<Uint8Array> | null;
                        if (!webBody) {
                            res.end();
                            return;
                        }
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
                                console.error('Error streaming UI response:', err);
                                res.destroy(err as Error);
                            }
                        })();
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
    console.log(`📡 Chat API: http://localhost:${PORT}/mcp-nexus/chat`);
    console.log(`🔧 MCP Server: http://localhost:${PORT}/mcp-nexus/server`);
    console.log(`❤️  Health: http://localhost:${PORT}/health`);
});
