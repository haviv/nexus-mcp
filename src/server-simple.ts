import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createServer } from 'http';
import 'dotenv/config';
import { systemPrompts } from './config/system-prompts.js';

const PORT = process.env.PORT || 3000;

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
        case '/mcp-nexus/chat': {
            if (req.method !== 'POST') {
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Method not allowed' }));
                return;
            }

            try {
                // Parse request body
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });

                req.on('end', async () => {
                    try {
                        const { messages } = JSON.parse(body);

                        console.log('=== CHAT REQUEST ===');
                        console.log('Messages received:', messages.length);
                        console.log('=== END REQUEST ===\n');

                        const result = streamText({
                            model: openai('gpt-4o'),
                            system: systemPrompts.grcAssistant,
                            messages: messages.map((msg: any) => ({
                                role: msg.role,
                                content: msg.parts?.map((part: any) => part.text).join('') || ''
                            })),
                        });

                        // Set headers for streaming response
                        res.writeHead(200, {
                            'Content-Type': 'text/plain; charset=utf-8',
                            'Transfer-Encoding': 'chunked',
                            'Cache-Control': 'no-cache',
                            'Connection': 'keep-alive',
                        });

                        // Stream the result
                        for await (const chunk of result.textStream) {
                            res.write(chunk);
                        }

                        res.end();
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
    console.log(`❤️  Health: http://localhost:${PORT}/health`);
});
