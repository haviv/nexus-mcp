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
    nexus: {
        url: process.env.MCP_NEXUS_URL || 'http://localhost:3000/mcp-nexus/server'
    },
    settings: {
        maxSteps: 20
    }
};
