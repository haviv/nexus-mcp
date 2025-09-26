#!/usr/bin/env node

import http from 'http';

const testData = {
    messages: [
        {
            role: 'user',
            parts: [
                {
                    type: 'text',
                    text: 'Hello, this is a test message'
                }
            ]
        }
    ]
};

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/mcp-nexus/chat',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': JSON.stringify(testData).length
    }
};

console.log('🧪 Testing MCP Nexus Chat API...');
console.log('📡 Endpoint: http://localhost:3000/mcp-nexus/chat');
console.log('📦 Test data:', JSON.stringify(testData, null, 2));

const req = http.request(options, (res) => {
    console.log(`\n✅ Response Status: ${res.statusCode}`);
    console.log('📋 Response Headers:', res.headers);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
        process.stdout.write(chunk.toString());
    });

    res.on('end', () => {
        console.log('\n\n🏁 Test completed');
    });
});

req.on('error', (error) => {
    console.error('❌ Test failed:', error.message);
});

req.write(JSON.stringify(testData));
req.end();
