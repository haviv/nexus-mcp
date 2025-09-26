#!/usr/bin/env node

import http from 'http';

console.log('🧪 Testing MCP Nexus Node.js Server');
console.log('=====================================\n');

// Test 1: Health Check
console.log('1️⃣ Testing Health Endpoint...');
const healthOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/health',
    method: 'GET'
};

const healthReq = http.request(healthOptions, (res) => {
    console.log(`   ✅ Status: ${res.statusCode}`);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log(`   📋 Response: ${data}\n`);

        // Test 2: Chat Endpoint
        console.log('2️⃣ Testing Chat Endpoint...');
        const chatData = {
            messages: [
                {
                    role: 'user',
                    parts: [
                        {
                            type: 'text',
                            text: 'Hello, this is a test message for the GRC assistant'
                        }
                    ]
                }
            ]
        };

        const chatOptions = {
            hostname: 'localhost',
            port: 3000,
            path: '/mcp-nexus/chat',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': JSON.stringify(chatData).length
            }
        };

        const chatReq = http.request(chatOptions, (res) => {
            console.log(`   ✅ Status: ${res.statusCode}`);
            console.log(`   📋 Headers: ${JSON.stringify(res.headers, null, 2)}`);

            let responseData = '';
            res.on('data', chunk => {
                responseData += chunk.toString();
                process.stdout.write(chunk.toString());
            });

            res.on('end', () => {
                console.log('\n   🏁 Chat test completed\n');

                // Test 3: Invalid Endpoint
                console.log('3️⃣ Testing Invalid Endpoint...');
                const invalidOptions = {
                    hostname: 'localhost',
                    port: 3000,
                    path: '/invalid',
                    method: 'GET'
                };

                const invalidReq = http.request(invalidOptions, (res) => {
                    console.log(`   ✅ Status: ${res.statusCode}`);
                    let invalidData = '';
                    res.on('data', chunk => invalidData += chunk);
                    res.on('end', () => {
                        console.log(`   📋 Response: ${invalidData}`);
                        console.log('\n🎉 All tests completed!');
                    });
                });

                invalidReq.on('error', (error) => {
                    console.error('   ❌ Invalid endpoint test failed:', error.message);
                });

                invalidReq.end();
            });
        });

        chatReq.on('error', (error) => {
            console.error('   ❌ Chat test failed:', error.message);
        });

        chatReq.write(JSON.stringify(chatData));
        chatReq.end();
    });
});

healthReq.on('error', (error) => {
    console.error('❌ Health test failed:', error.message);
});

healthReq.end();
