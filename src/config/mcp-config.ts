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
    nexus: {
        url: process.env.MCP_NEXUS_URL || 'http://localhost:3000/mcp-nexus/server'
    },
    settings: {
        maxSteps: 20
    }
};
