# AI Agent API - Design Document

## Overview

The **AI Agent API** is a platform service that abstracts AI-related tasks for application teams. It provides a centralized, reusable way to define and execute AI agents across your identity management platform.

**What is it?**
- An HTTPS-based microservice that manages AI agents
- Exposes REST APIs for agent creation, configuration, and execution
- Handles authentication, multi-tenancy, and tool orchestration
- Consumed by other services (web apps, backend services, integrations)

**Key Capabilities:**
- Define agents once, reuse via multiple consumption methods (chat, stream, async, scheduled)
- JWT-based authentication with automatic tenant resolution
- Tool registry with permission-based access control
- Full audit trail and observability

---

## Motivation

### The Problem: AI Integration is Hard

Application teams building AI features face common challenges:

**1. Repetitive Boilerplate**
- Every team writes their own LLM integration code
- Duplicated prompt engineering across services
- No standard way to handle streaming, retries, errors
- Each service manages its own API keys and rate limits

**2. No Reusability**
- Same AI capabilities rebuilt multiple times
- Can't share agents between web UI, mobile app, and backend services
- Prompt changes require code deployments

**3. Lack of Governance**
- No visibility into AI usage across platform
- No audit trail of what was asked and answered
- Difficult to enforce security and compliance policies
- No cost tracking or rate limiting

**4. Complex Multi-Tenancy**
- Each tenant has different data sources and schemas
- Hard to inject tenant context into prompts
- Difficult to isolate tenant data

### The Solution: AI Agent as a Service

This API provides a **centralized platform service** that abstracts all AI complexity:

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Teams                         │
│  (Web App, Mobile App, Backend Services, Integrations)      │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS + JWT
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI Agent API Service                      │
│  • Agent Registry                                            │
│  • Tool Orchestration                                        │
│  • Multi-Tenancy                                             │
│  • Audit & Observability                                     │
└────────────────────────────┬────────────────────────────────┘
                             │
                ┌────────────┼────────────┐
                ▼            ▼            ▼
         ┌──────────┐  ┌──────────┐  ┌──────────┐
         │   LLM    │  │  Tools   │  │ Tenant   │
         │ Provider │  │  (MCP)   │  │    DB    │
         └──────────┘  └──────────┘  └──────────┘
```

### Core Concept: Define Once, Consume Anywhere

**Step 1: Define an Agent**
```json
{
  "name": "GRC Compliance Assistant",
  "type": "conversational",
  "capabilities": ["query", "analyze", "recommend"],
  "tools": ["mssql-query", "postgres-query"],
  "systemPrompt": "You are a GRC specialist...",
  "model": "gpt-4o"
}
```

**Step 2: Consume via Different Methods**
```javascript
// Method 1: Synchronous (for backend services)
POST /v1/agents/{id}
{ "messages": [...], "stream": false }

// Method 2: Streaming (for web UI)
POST /v1/agents/{id}
{ "messages": [...], "stream": true }

// Method 3: Async (for long reports)
POST /v1/jobs
{ "agentId": "{id}", "messages": [...], "webhook": "..." }

// Method 4: Scheduled (for recurring tasks)
POST /v1/schedules
{ "agentId": "{id}", "cron": "0 9 * * MON", ... }
```

**Same agent, different consumption patterns** - no code duplication.

### How It Works

**1. Authentication & Tenant Resolution**
```
Client Request
    ↓
JWT Token → Verify Signature → Extract Claims
    ↓
{
  "sub": "user_123",
  "tenant_id": "acme_corp",
  "roles": ["analyst"]
}
    ↓
Query Tenant DB → Load Tenant Config
    ↓
{
  "dbConnectionString": "Server=...",
  "allowedTools": ["mssql-query"],
  "rateLimits": {...}
}
    ↓
Execute Agent with Tenant Context
```

**2. Agent Execution**
```
1. Load agent configuration (tools, prompt, model)
2. Inject tenant context into system prompt
3. Initialize tools with tenant credentials
4. Execute LLM with tool calling enabled
5. Stream/return results
6. Log execution for audit
```

### Key Benefits

**For Application Teams:**
- ✅ No LLM integration code to write
- ✅ Reuse agents across all services
- ✅ Update prompts without deployments
- ✅ Built-in streaming, retries, error handling

**For Platform Team:**
- ✅ Centralized AI governance
- ✅ Cost tracking and rate limiting
- ✅ Security and compliance enforcement
- ✅ Single point for LLM provider management

**For Business:**
- ✅ Faster feature development
- ✅ Consistent AI experience across products
- ✅ Better observability and debugging
- ✅ Lower costs through shared infrastructure

---

## Complete Example: End-to-End Flow

### Scenario
A web application needs to add an AI-powered compliance assistant that can answer questions about user violations.

### Step 1: Application Team Creates an Agent

```http
POST https://ai-agent-api.company.com/v1/agents
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Compliance Assistant",
  "description": "Answers questions about SoD violations and compliance",
  "type": "conversational",
  "capabilities": ["query", "analyze", "recommend"],
  "tools": ["mssql-query"],
  "systemPrompt": "You are a GRC compliance expert. Help users understand segregation of duties violations, analyze risk, and recommend remediation actions. Always provide clear, actionable insights.",
  "model": {
    "provider": "openai",
    "name": "gpt-4o",
    "temperature": 0.7
  },
  "config": {
    "maxSteps": 20,
    "maxTokens": 4096,
    "timeout": 120000
  },
  "memory": {
    "enabled": true,
    "maxHistory": 50
  },
  "contextInjection": {
    "includeUserRole": true,
    "includeDepartment": true
  }
}
```

**Response:**
```json
{
  "id": "agent_grc_001",
  "tenantId": "acme_corp",
  "name": "Compliance Assistant",
  "version": 1,
  "status": "active",
  "createdAt": "2026-01-12T10:00:00Z"
}
```

Agent is now created and ready to use!

---

### Step 2: Web UI Consumes Agent (Streaming)

User opens chat interface and asks a question.

```http
POST https://ai-agent-api.company.com/v1/agents/agent_grc_001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "Show me users with critical SoD violations"
    }
  ],
  "stream": true
}
```

**Behind the Scenes:**

1. **JWT Verification**
   ```json
   {
     "sub": "user_john_smith",
     "tenant_id": "acme_corp",
     "roles": ["compliance_analyst"],
     "department": "Risk Management"
   }
   ```

2. **Tenant Resolution**
   - Query tenant database with `tenant_id = "acme_corp"`
   - Load tenant configuration:
     ```json
     {
       "dbConnectionString": "Server=acme-sql.company.com;Database=PathLock;...",
       "allowedTools": ["mssql-query"],
       "rateLimits": {
         "requestsPerMinute": 100,
         "tokensPerDay": 100000
       }
     }
     ```

3. **Context Injection**
   - System prompt is enhanced with user context:
     ```
     You are a GRC compliance expert...
     
     Current User Context:
     - User: john.smith@acme.com
     - Role: Compliance Analyst
     - Department: Risk Management
     
     Use this context to personalize your responses.
     ```

4. **Agent Execution**
   - Agent analyzes the question
   - Decides to use `mssql-query` tool
   - Generates SQL query
   - Executes against tenant database
   - Formats results
   - Provides analysis

**Streaming Response (SSE):**
```
event: start
data: {"executionId": "exec_12345", "agentId": "agent_grc_001"}

event: step
data: {"type": "tool_call", "tool": "mssql-query", "status": "started"}

event: step
data: {"type": "tool_call", "tool": "mssql-query", "status": "completed", "duration": 234}

event: token
data: {"content": "Found"}

event: token
data: {"content": " 27"}

event: token
data: {"content": " users"}

event: token
data: {"content": " with"}

event: token
data: {"content": " critical"}

event: token
data: {"content": " violations"}

event: token
data: {"content": ":\n\n"}

event: token
data: {"content": "| User | Violations | Department |\n"}

event: token
data: {"content": "|------|------------|------------|\n"}

event: token
data: {"content": "| John Smith | 3 | Finance |\n"}

event: token
data: {"content": "| Jane Doe | 2 | Operations |\n"}

event: done
data: {"usage": {"totalTokens": 1650}, "duration": 3420}
```

**Web UI renders the response in real-time as tokens arrive.**

---

### Step 3: Backend Service Consumes Same Agent (Sync)

A backend service needs to check violations as part of a workflow.

```http
POST https://ai-agent-api.company.com/v1/agents/agent_grc_001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "How many critical violations does user jsmith have?"
    }
  ],
  "stream": false
}
```

**Response (JSON):**
```json
{
  "id": "exec_12346",
  "agentId": "agent_grc_001",
  "status": "completed",
  "result": {
    "role": "assistant",
    "content": "User jsmith has **3 critical violations**:\n\n1. Finance Approver + Requestor (SoD Rule: Purchase Process)\n2. Payment Creator + Approver (SoD Rule: Payment Release)\n3. Vendor Master + Payment Release (SoD Rule: Vendor Management)\n\n**Business Impact:** Could enable unauthorized payments.\n\n**Recommended Actions:**\n- Remove Finance Approver role\n- Route for manager approval"
  },
  "steps": [
    {
      "type": "tool_call",
      "tool": "mssql-query",
      "input": {
        "sql": "SELECT TOP 20 v.Id, sfc.Name, sl.SeverityName FROM SoxUserViolations v JOIN Users u ON v.UserId = u.UserId JOIN SoxForbiddenCombinations sfc ON v.ForbiddenCombinationId = sfc.Id JOIN SeverityLevel sl ON sfc.RiskLevel = sl.SeverityId WHERE u.SapUserName = 'jsmith' AND sl.SeverityName = 'Critical'"
      },
      "output": {
        "rows": [
          {"Id": 1, "Name": "Finance Approver + Requestor", "SeverityName": "Critical"},
          {"Id": 2, "Name": "Payment Creator + Approver", "SeverityName": "Critical"},
          {"Id": 3, "Name": "Vendor Master + Payment Release", "SeverityName": "Critical"}
        ]
      },
      "duration": 156
    }
  ],
  "usage": {
    "promptTokens": 890,
    "completionTokens": 340,
    "totalTokens": 1230
  },
  "duration": 2100,
  "timestamp": "2026-01-12T10:35:00Z"
}
```

**Backend service parses JSON response and continues workflow.**

---

### Step 4: Scheduled Report (Recurring)

Compliance team wants a weekly report every Monday.

```http
POST https://ai-agent-api.company.com/v1/schedules
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "agentId": "agent_grc_001",
  "name": "Weekly Critical Violations Report",
  "cron": "0 9 * * MON",
  "timezone": "America/New_York",
  "input": {
    "messages": [
      {
        "role": "user",
        "content": "Generate a summary of all critical SoD violations from the past week. Include trends, top violators, and recommended actions."
      }
    ]
  },
  "webhook": "https://compliance-app.company.com/webhooks/weekly-report",
  "webhookHeaders": {
    "X-API-Key": "secret_webhook_key"
  },
  "enabled": true
}
```

**Response:**
```json
{
  "id": "schedule_001",
  "agentId": "agent_grc_001",
  "name": "Weekly Critical Violations Report",
  "cron": "0 9 * * MON",
  "nextRun": "2026-01-13T09:00:00Z",
  "enabled": true,
  "createdAt": "2026-01-12T10:40:00Z"
}
```

**Every Monday at 9 AM:**
1. Agent executes automatically
2. Generates report
3. Sends result to webhook
4. Compliance app receives and displays report

---

### Step 5: Audit Trail

Platform team wants to see all agent activity.

```http
GET https://ai-agent-api.company.com/v1/executions?agentId=agent_grc_001&from=2026-01-12&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "executions": [
    {
      "id": "exec_12346",
      "agentId": "agent_grc_001",
      "tenantId": "acme_corp",
      "userId": "user_backend_service",
      "mode": "sync",
      "status": "completed",
      "input": {
        "messages": [
          {"role": "user", "content": "How many critical violations does user jsmith have?"}
        ]
      },
      "toolCalls": [
        {"tool": "mssql-query", "duration": 156}
      ],
      "usage": {"totalTokens": 1230},
      "duration": 2100,
      "timestamp": "2026-01-12T10:35:00Z"
    },
    {
      "id": "exec_12345",
      "agentId": "agent_grc_001",
      "tenantId": "acme_corp",
      "userId": "user_john_smith",
      "mode": "stream",
      "status": "completed",
      "input": {
        "messages": [
          {"role": "user", "content": "Show me users with critical SoD violations"}
        ]
      },
      "toolCalls": [
        {"tool": "mssql-query", "duration": 234}
      ],
      "usage": {"totalTokens": 1650},
      "duration": 3420,
      "timestamp": "2026-01-12T10:30:00Z"
    }
  ],
  "total": 247,
  "limit": 10
}
```

**Full visibility into:**
- Who used the agent
- What they asked
- Which tools were called
- Token usage and costs
- Performance metrics

---

### Summary: One Agent, Multiple Consumption Patterns

```
┌─────────────────────────────────────────────────────────────┐
│              Agent: "Compliance Assistant"                   │
│  (Defined once with tools, prompt, model config)            │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┬──────────────┐
         ▼               ▼               ▼              ▼
    ┌────────┐      ┌────────┐     ┌────────┐    ┌──────────┐
    │ Web UI │      │Backend │     │ Mobile │    │Scheduled │
    │(Stream)│      │ (Sync) │     │ (Sync) │    │  (Cron)  │
    └────────┘      └────────┘     └────────┘    └──────────┘
```

**Key Takeaways:**
1. ✅ **Define once** - Agent configuration is reusable
2. ✅ **Consume anywhere** - Same agent, different methods
3. ✅ **Automatic multi-tenancy** - JWT → tenant resolution → isolated data
4. ✅ **Full audit trail** - Every execution is logged
5. ✅ **No code duplication** - All services use same API

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Platform Services                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐         ┌──────────────┐         ┌─────────────┐ │
│  │  Nexus FE    │         │  Nexus BE    │         │   Mobile    │ │
│  │  (React)     │         │  (Node.js)   │         │     App     │ │
│  │              │         │              │         │             │ │
│  │  Port: 5173  │         │  Port: 3000  │         │             │ │
│  └──────┬───────┘         └──────┬───────┘         └──────┬──────┘ │
│         │                        │                        │        │
│         │ HTTPS + JWT            │ HTTPS + JWT            │ HTTPS  │
│         │                        │                        │        │
└─────────┼────────────────────────┼────────────────────────┼────────┘
          │                        │                        │
          └────────────────────────┼────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Nexus AI Agent Service                            │
│                    (This Service)                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    API Layer (REST)                            │ │
│  │  • POST /v1/agents                                             │ │
│  │  • POST /v1/agents/{id}  (execute)                             │ │
│  │  • POST /v1/sessions                                           │ │
│  │  • POST /v1/jobs                                               │ │
│  │  • POST /v1/schedules                                          │ │
│  └────────────────────────────┬───────────────────────────────────┘ │
│                               │                                      │
│  ┌────────────────────────────┴───────────────────────────────────┐ │
│  │                    Auth & Tenant Resolution                    │ │
│  │  • JWT Verification                                            │ │
│  │  • Extract tenant_id from JWT                                  │ │
│  │  • Query Tenant DB for config                                  │ │
│  │  • Rate Limiting                                               │ │
│  └────────────────────────────┬───────────────────────────────────┘ │
│                               │                                      │
│  ┌────────────────────────────┴───────────────────────────────────┐ │
│  │                    Agent Execution Engine                      │ │
│  │  • Agent Registry                                              │ │
│  │  • Tool Registry & Permissions                                 │ │
│  │  • Session Manager                                             │ │
│  │  • Context Injection                                           │ │
│  │  • Job Queue (async)                                           │ │
│  │  • Scheduler (cron)                                            │ │
│  └────────────────────────────┬───────────────────────────────────┘ │
│                               │                                      │
│                               │                                      │
│  Port: 8080                   │                                      │
└───────────────────────────────┼──────────────────────────────────────┘
                                │
                   ┌────────────┼────────────┬──────────────┐
                   │            │            │              │
                   ▼            ▼            ▼              ▼
         ┌─────────────┐ ┌─────────────┐ ┌──────────┐ ┌──────────┐
         │   OpenAI    │ │    MCP      │ │ Tenant   │ │ Platform │
         │     API     │ │   Tools     │ │    DB    │ │    DB    │
         │             │ │             │ │          │ │          │
         │  (GPT-4o)   │ │ (SQL, etc)  │ │(Per-Tenant)│(Shared) │
         └─────────────┘ └─────────────┘ └──────────┘ └──────────┘
                                              │              │
                                              │              │
                                         ┌────┴──────────────┴────┐
                                         │                         │
                                         │   SQL Server Cluster    │
                                         │                         │
                                         │  • Tenant DBs (isolated)│
                                         │  • Platform DB (shared) │
                                         │    - Agents             │
                                         │    - Sessions           │
                                         │    - Executions (audit) │
                                         │    - Jobs               │
                                         │    - Schedules          │
                                         │    - Tenant Registry    │
                                         └─────────────────────────┘
```

### Request Flow

```
1. Client Request
   ┌─────────────┐
   │  Nexus FE   │  User asks: "Show me critical violations"
   └──────┬──────┘
          │
          │ POST /v1/agents/agent_123
          │ Authorization: Bearer eyJ...
          │ { "messages": [...], "stream": true }
          ▼
   ┌─────────────────────────────────────────────┐
   │      Nexus AI Agent Service                 │
   └─────────────────────────────────────────────┘

2. Authentication & Tenant Resolution
   ┌─────────────────────────────────────────────┐
   │  JWT Middleware                             │
   │  • Verify signature                         │
   │  • Extract: { tenant_id: "acme_corp" }      │
   └──────┬──────────────────────────────────────┘
          │
          │ Query Platform DB
          ▼
   ┌─────────────────────────────────────────────┐
   │  Tenant Registry                            │
   │  • dbConnectionString                       │
   │  • allowedTools: ["mssql-query"]            │
   │  • rateLimits: {...}                        │
   └──────┬──────────────────────────────────────┘

3. Agent Execution
   ┌─────────────────────────────────────────────┐
   │  Load Agent Config                          │
   │  • systemPrompt                             │
   │  • tools: ["mssql-query"]                   │
   │  • model: "gpt-4o"                          │
   └──────┬──────────────────────────────────────┘
          │
          │ Inject tenant context
          ▼
   ┌─────────────────────────────────────────────┐
   │  Execute LLM with Tools                     │
   │  1. Send prompt to OpenAI                   │
   │  2. LLM decides to call mssql-query         │
   │  3. Execute SQL on Tenant DB                │
   │  4. Return results to LLM                   │
   │  5. LLM formats response                    │
   └──────┬──────────────────────────────────────┘
          │
          │ Stream response (SSE)
          ▼
   ┌─────────────────────────────────────────────┐
   │  Nexus FE                                   │
   │  Renders response in real-time              │
   └─────────────────────────────────────────────┘

4. Audit
   ┌─────────────────────────────────────────────┐
   │  Platform DB - Executions Table             │
   │  • Log input, output, tools used            │
   │  • Track token usage, duration              │
   │  • Store for compliance & analytics         │
   └─────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Technology |
|-----------|---------------|------------|
| **Nexus FE** | User interface, chat UI | React, Vite, Tailwind |
| **Nexus BE** | Business logic, APIs | Node.js, Express |
| **Mobile App** | Mobile interface | React Native |
| **Nexus AI Agent** | AI orchestration, agent execution | Node.js, Vercel AI SDK |
| **Platform DB** | Agent configs, audit logs, tenant registry | SQL Server (shared) |
| **Tenant DBs** | Customer data (users, roles, violations) | SQL Server (isolated) |
| **OpenAI API** | LLM inference | GPT-4o |
| **MCP Tools** | Database queries, integrations | Model Context Protocol |

---

## Core Concepts

### **Agent**
An AI assistant with:
- **Identity**: Name, description, version
- **Capabilities**: List of enabled tools
- **Behavior**: System prompt, model config
- **Memory**: Optional conversation history
- **Context**: Auto-injected user/tenant metadata

### **Tool**
A capability the agent can use:
- Database queries (SQL Server, Postgres)
- External APIs
- File operations
- Custom integrations

### **Session**
A conversation thread with:
- Message history
- Context accumulation
- Memory persistence

### **Execution**
A single agent run with:
- Input messages
- Tool calls
- Output result
- Audit trail

---

## API Reference

### Base URL
```
https://api.yourdomain.com/v1
```

### Authentication
All requests require JWT token:
```http
Authorization: Bearer <jwt_token>
```

**JWT Claims:**
```json
{
  "sub": "user_123",
  "tenant_id": "pathlock_corp",
  "roles": ["analyst", "admin"],
  "department": "compliance"
}
```

---

## Endpoints (16 Total)

### **1. Agents (6 endpoints)**

#### Create Agent
```http
POST /v1/agents
```

**Request:**
```json
{
  "name": "GRC Compliance Assistant",
  "description": "Analyzes identity and access compliance data",
  "systemPrompt": "You are a GRC specialist...",
  "tools": ["mssql-query", "postgres-query"],
  "model": {
    "provider": "openai",
    "name": "gpt-4o",
    "temperature": 0.7
  },
  "config": {
    "maxSteps": 20,
    "maxTokens": 4096,
    "timeout": 120000
  },
  "memory": {
    "enabled": true,
    "maxHistory": 50
  },
  "contextInjection": {
    "includeUserRole": true,
    "includeDepartment": true,
    "customFields": ["region"]
  }
}
```

**Response:**
```json
{
  "id": "agent_abc123",
  "tenantId": "pathlock_corp",
  "name": "GRC Compliance Assistant",
  "version": 1,
  "status": "active",
  "createdAt": "2026-01-12T10:00:00Z"
}
```

---

#### List Agents
```http
GET /v1/agents?status=active&limit=50
```

**Response:**
```json
{
  "agents": [
    {
      "id": "agent_abc123",
      "name": "GRC Compliance Assistant",
      "status": "active",
      "createdAt": "2026-01-12T10:00:00Z"
    }
  ],
  "total": 5,
  "limit": 50,
  "offset": 0
}
```

---

#### Get Agent
```http
GET /v1/agents/{agentId}
```

**Response:**
```json
{
  "id": "agent_abc123",
  "name": "GRC Compliance Assistant",
  "systemPrompt": "You are a GRC specialist...",
  "tools": ["mssql-query", "postgres-query"],
  "model": { ... },
  "config": { ... },
  "memory": { ... },
  "stats": {
    "totalExecutions": 1247,
    "avgDuration": 3420,
    "lastExecuted": "2026-01-12T15:30:00Z"
  }
}
```

---

#### Update Agent
```http
PUT /v1/agents/{agentId}
```

**Request:**
```json
{
  "systemPrompt": "Updated prompt...",
  "config": {
    "maxSteps": 25
  }
}
```

---

#### Delete Agent
```http
DELETE /v1/agents/{agentId}
```

---

#### Execute Agent ⭐
```http
POST /v1/agents/{agentId}
```

**Request (Sync):**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Show me users with critical SoD violations"
    }
  ],
  "sessionId": "session_456",
  "toolChoice": "auto",
  "maxSteps": 10,
  "stream": false
}
```

**Response (Sync):**
```json
{
  "id": "exec_789",
  "agentId": "agent_abc123",
  "sessionId": "session_456",
  "status": "completed",
  "result": {
    "role": "assistant",
    "content": "Found 27 users with critical violations:\n\n| User | Violations | Risk Level |\n|------|-----------|------------|\n| jsmith | 3 | Critical |..."
  },
  "steps": [
    {
      "type": "tool_call",
      "tool": "mssql-query",
      "input": {
        "sql": "SELECT TOP 20 u.FullName, COUNT(v.Id) as ViolationCount..."
      },
      "output": {
        "rows": [...]
      },
      "duration": 234
    },
    {
      "type": "reasoning",
      "content": "Analyzing the query results..."
    }
  ],
  "usage": {
    "promptTokens": 1200,
    "completionTokens": 450,
    "totalTokens": 1650
  },
  "duration": 3420,
  "timestamp": "2026-01-12T10:30:00Z"
}
```

**Request (Streaming):**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Analyze risk trends over the last quarter"
    }
  ],
  "sessionId": "session_456",
  "stream": true
}
```

**Response (SSE Stream):**
```
event: start
data: {"executionId": "exec_790", "agentId": "agent_abc123"}

event: step
data: {"type": "tool_call", "tool": "mssql-query", "status": "started"}

event: step
data: {"type": "tool_call", "tool": "mssql-query", "status": "completed", "duration": 156}

event: token
data: {"content": "Based"}

event: token
data: {"content": " on"}

event: token
data: {"content": " the"}

event: token
data: {"content": " analysis"}

event: done
data: {"usage": {"totalTokens": 1200}, "duration": 2340}
```

---

### **2. Sessions (3 endpoints)**

#### Create Session
```http
POST /v1/sessions
```

**Request:**
```json
{
  "agentId": "agent_abc123",
  "metadata": {
    "userId": "user_123",
    "source": "web_app"
  }
}
```

**Response:**
```json
{
  "id": "session_456",
  "agentId": "agent_abc123",
  "createdAt": "2026-01-12T10:00:00Z"
}
```

---

#### Get Session
```http
GET /v1/sessions/{sessionId}
```

**Response:**
```json
{
  "id": "session_456",
  "agentId": "agent_abc123",
  "messages": [
    {
      "role": "user",
      "content": "Show violations",
      "timestamp": "2026-01-12T10:00:00Z"
    },
    {
      "role": "assistant",
      "content": "Found 27 violations...",
      "timestamp": "2026-01-12T10:00:03Z"
    }
  ],
  "createdAt": "2026-01-12T10:00:00Z",
  "lastActivity": "2026-01-12T10:00:03Z"
}
```

---

#### Delete Session
```http
DELETE /v1/sessions/{sessionId}
```

---

### **3. Jobs (3 endpoints)**

#### Create Async Job
```http
POST /v1/jobs
```

**Request:**
```json
{
  "agentId": "agent_abc123",
  "messages": [
    {
      "role": "user",
      "content": "Generate full compliance report for Q4 2025"
    }
  ],
  "webhook": "https://myapp.com/webhooks/reports",
  "webhookHeaders": {
    "X-API-Key": "secret_key"
  }
}
```

**Response:**
```json
{
  "jobId": "job_789",
  "status": "queued",
  "createdAt": "2026-01-12T10:00:00Z"
}
```

---

#### Get Job Status
```http
GET /v1/jobs/{jobId}
```

**Response:**
```json
{
  "jobId": "job_789",
  "agentId": "agent_abc123",
  "status": "completed",
  "result": {
    "content": "Full report content..."
  },
  "usage": {
    "totalTokens": 5420
  },
  "createdAt": "2026-01-12T10:00:00Z",
  "completedAt": "2026-01-12T10:02:34Z"
}
```

**Status values:** `queued`, `running`, `completed`, `failed`, `cancelled`

---

#### Cancel Job
```http
DELETE /v1/jobs/{jobId}
```

---

### **4. Schedules (3 endpoints)**

#### Create Schedule
```http
POST /v1/schedules
```

**Request:**
```json
{
  "agentId": "agent_abc123",
  "name": "Weekly Violation Report",
  "cron": "0 9 * * MON",
  "timezone": "America/New_York",
  "input": {
    "messages": [
      {
        "role": "user",
        "content": "Generate weekly SoD violation summary"
      }
    ]
  },
  "webhook": "https://myapp.com/webhooks/reports",
  "enabled": true
}
```

**Response:**
```json
{
  "id": "schedule_123",
  "agentId": "agent_abc123",
  "name": "Weekly Violation Report",
  "cron": "0 9 * * MON",
  "nextRun": "2026-01-13T09:00:00Z",
  "enabled": true,
  "createdAt": "2026-01-12T10:00:00Z"
}
```

---

#### Get Schedule
```http
GET /v1/schedules/{scheduleId}
```

**Response:**
```json
{
  "id": "schedule_123",
  "agentId": "agent_abc123",
  "name": "Weekly Violation Report",
  "cron": "0 9 * * MON",
  "nextRun": "2026-01-13T09:00:00Z",
  "lastRun": "2026-01-06T09:00:00Z",
  "runs": [
    {
      "executionId": "exec_890",
      "status": "completed",
      "timestamp": "2026-01-06T09:00:00Z"
    }
  ],
  "enabled": true
}
```

---

#### Delete Schedule
```http
DELETE /v1/schedules/{scheduleId}
```

---

### **5. Tools (1 endpoint)**

#### List Tools
```http
GET /v1/tools
```

**Response:**
```json
{
  "tools": [
    {
      "id": "mssql-query",
      "name": "SQL Server Query",
      "description": "Execute read-only SQL queries against tenant database",
      "permissions": ["read"],
      "schema": {
        "type": "object",
        "properties": {
          "sql": {
            "type": "string",
            "description": "SQL query to execute"
          }
        },
        "required": ["sql"]
      }
    },
    {
      "id": "postgres-query",
      "name": "PostgreSQL Query",
      "description": "Execute queries against PostgreSQL database",
      "permissions": ["read"],
      "schema": { ... }
    }
  ]
}
```

---

## Data Models

### Agent
```typescript
interface Agent {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  systemPrompt: string;
  tools: string[];
  model: ModelConfig;
  config: AgentConfig;
  memory: MemoryConfig;
  contextInjection: ContextConfig;
  version: number;
  status: 'active' | 'disabled' | 'deprecated';
  createdAt: Date;
  updatedAt: Date;
}

interface ModelConfig {
  provider: 'openai' | 'anthropic' | 'azure';
  name: string;
  temperature: number;
  topP?: number;
}

interface AgentConfig {
  maxSteps: number;
  maxTokens: number;
  timeout: number;
}

interface MemoryConfig {
  enabled: boolean;
  maxHistory: number;
}

interface ContextConfig {
  includeUserRole: boolean;
  includeDepartment: boolean;
  customFields: string[];
}
```

### Tool
```typescript
interface Tool {
  id: string;
  name: string;
  description: string;
  permissions: ('read' | 'write' | 'admin')[];
  schema: JSONSchema;
  category: string;
}
```

### Session
```typescript
interface Session {
  id: string;
  agentId: string;
  tenantId: string;
  messages: Message[];
  metadata: Record<string, any>;
  createdAt: Date;
  lastActivity: Date;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}
```

### Execution
```typescript
interface Execution {
  id: string;
  agentId: string;
  sessionId?: string;
  tenantId: string;
  userId: string;
  status: 'running' | 'completed' | 'failed';
  input: {
    messages: Message[];
  };
  result?: {
    role: 'assistant';
    content: string;
  };
  steps: ExecutionStep[];
  usage: TokenUsage;
  duration: number;
  timestamp: Date;
}

interface ExecutionStep {
  type: 'tool_call' | 'reasoning';
  tool?: string;
  input?: any;
  output?: any;
  content?: string;
  duration: number;
}

interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}
```

### Job
```typescript
interface Job {
  jobId: string;
  agentId: string;
  tenantId: string;
  userId: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  input: {
    messages: Message[];
  };
  result?: any;
  webhook?: string;
  webhookHeaders?: Record<string, string>;
  usage?: TokenUsage;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}
```

### Schedule
```typescript
interface Schedule {
  id: string;
  agentId: string;
  tenantId: string;
  name: string;
  cron: string;
  timezone: string;
  input: {
    messages: Message[];
  };
  webhook: string;
  webhookHeaders?: Record<string, string>;
  enabled: boolean;
  nextRun: Date;
  lastRun?: Date;
  createdAt: Date;
}
```

---

## Multi-Tenancy

### Tenant Resolution Flow
```
1. Client sends JWT in Authorization header
2. API verifies JWT signature
3. Extract tenant_id from JWT claims
4. Load tenant configuration:
   - Database connection string
   - Allowed tools
   - Rate limits
   - Custom settings
5. Inject tenant context into agent execution
```

### Tenant Context
```typescript
interface TenantContext {
  tenantId: string;
  dbConnectionString: string;
  allowedTools: string[];
  rateLimits: {
    requestsPerMinute: number;
    tokensPerDay: number;
  };
  customConfig: Record<string, any>;
}
```

### Data Isolation
- Each tenant has their own database/schema
- Agents are tenant-scoped (cannot be shared)
- Tools execute with tenant-specific credentials
- All queries include tenant_id filter

---

## Tool Permission System

### Permission Levels
- **read**: Query data only
- **write**: Modify data
- **admin**: Administrative operations

### Tool Configuration
```typescript
interface ToolPermission {
  toolId: string;
  allowedOperations: ('read' | 'write' | 'admin')[];
  scopeRestrictions?: {
    tables?: string[];
    schemas?: string[];
    maxRows?: number;
  };
}
```

### Runtime Enforcement
```typescript
// Before executing tool
function checkPermission(
  tool: Tool,
  operation: string,
  tenantContext: TenantContext
): boolean {
  // 1. Check if tool is in tenant's allowed list
  if (!tenantContext.allowedTools.includes(tool.id)) {
    return false;
  }
  
  // 2. Check operation permission
  if (!tool.permissions.includes(operation)) {
    return false;
  }
  
  // 3. Check scope restrictions
  if (tool.scopeRestrictions) {
    // Validate against restrictions
  }
  
  return true;
}
```

---

## Context Injection

### Automatic Context
When `contextInjection` is enabled, the system automatically adds context to the agent's system prompt:

```
Original System Prompt:
"You are a GRC specialist..."

Injected Context:
"You are a GRC specialist...

Current User Context:
- User: john.smith@company.com
- Role: Compliance Analyst
- Department: Risk Management
- Region: North America

Use this context to personalize your responses."
```

### Custom Fields
```json
{
  "contextInjection": {
    "includeUserRole": true,
    "includeDepartment": true,
    "customFields": ["region", "businessUnit", "clearanceLevel"]
  }
}
```

---

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "AGENT_NOT_FOUND",
    "message": "Agent with id 'agent_xyz' not found",
    "details": {
      "agentId": "agent_xyz",
      "tenantId": "pathlock_corp"
    }
  }
}
```

### Error Codes
- `UNAUTHORIZED`: Invalid or missing JWT
- `FORBIDDEN`: Insufficient permissions
- `AGENT_NOT_FOUND`: Agent doesn't exist
- `TOOL_NOT_ALLOWED`: Tool not in tenant's allowed list
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `EXECUTION_TIMEOUT`: Agent execution timed out
- `TOOL_EXECUTION_FAILED`: Tool call failed
- `INVALID_REQUEST`: Malformed request

---

## Rate Limiting

### Per-Tenant Limits
```typescript
interface RateLimits {
  requestsPerMinute: number;
  tokensPerDay: number;
  concurrentExecutions: number;
  maxAgents: number;
}
```

### Response Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1673548800
```

---

## Audit & Observability

### Audit Log Entry
```typescript
interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  agentId: string;
  executionId: string;
  action: 'agent.execute' | 'agent.create' | 'agent.update' | 'agent.delete';
  input: any;
  output: any;
  toolCalls: {
    tool: string;
    input: any;
    output: any;
    duration: number;
  }[];
  usage: TokenUsage;
  duration: number;
  status: 'success' | 'failure';
  error?: string;
  timestamp: Date;
}
```

### Metrics
- Total executions per agent
- Average execution time
- Token usage per tenant/agent
- Tool usage frequency
- Error rates
- Success rates

---

## Security Considerations

### JWT Validation
- Verify signature with shared secret or public key
- Check expiration (`exp` claim)
- Validate issuer (`iss` claim)
- Extract tenant_id and user context

### Tool Execution
- All database tools are read-only by default
- SQL injection prevention via parameterized queries
- Query timeout enforcement
- Row limit enforcement (default: 20 rows)

### Data Isolation
- Tenant ID in all database queries
- Connection string per tenant
- No cross-tenant data access
- Audit all data access

---

## Implementation Notes

### Technology Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: Express or Fastify
- **AI SDK**: Vercel AI SDK
- **LLM Providers**: OpenAI, Anthropic
- **MCP**: Model Context Protocol for tools
- **Database**: SQL Server (per tenant)
- **Auth**: JWT with bcrypt
- **Streaming**: Server-Sent Events (SSE)

### Key Libraries
```json
{
  "dependencies": {
    "ai": "^3.x",
    "@ai-sdk/openai": "^0.x",
    "@modelcontextprotocol/sdk": "^1.x",
    "jsonwebtoken": "^9.x",
    "bcryptjs": "^2.x",
    "node-cron": "^3.x"
  }
}
```

### Database Schema (Simplified)
```sql
-- Agents table
CREATE TABLE agents (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  system_prompt TEXT,
  tools JSON,
  model_config JSON,
  agent_config JSON,
  memory_config JSON,
  context_injection JSON,
  version INT DEFAULT 1,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tenant (tenant_id)
);

-- Sessions table
CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY,
  agent_id VARCHAR(255) NOT NULL,
  tenant_id VARCHAR(255) NOT NULL,
  messages JSON,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_agent (agent_id),
  INDEX idx_tenant (tenant_id)
);

-- Executions table (audit log)
CREATE TABLE executions (
  id VARCHAR(255) PRIMARY KEY,
  agent_id VARCHAR(255) NOT NULL,
  session_id VARCHAR(255),
  tenant_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  status VARCHAR(50),
  input JSON,
  result JSON,
  steps JSON,
  usage JSON,
  duration INT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_agent (agent_id),
  INDEX idx_tenant (tenant_id),
  INDEX idx_timestamp (timestamp)
);

-- Jobs table
CREATE TABLE jobs (
  job_id VARCHAR(255) PRIMARY KEY,
  agent_id VARCHAR(255) NOT NULL,
  tenant_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'queued',
  input JSON,
  result JSON,
  webhook VARCHAR(500),
  webhook_headers JSON,
  usage JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_tenant (tenant_id)
);

-- Schedules table
CREATE TABLE schedules (
  id VARCHAR(255) PRIMARY KEY,
  agent_id VARCHAR(255) NOT NULL,
  tenant_id VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  cron VARCHAR(100),
  timezone VARCHAR(100),
  input JSON,
  webhook VARCHAR(500),
  webhook_headers JSON,
  enabled BOOLEAN DEFAULT true,
  next_run TIMESTAMP,
  last_run TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_agent (agent_id),
  INDEX idx_enabled (enabled),
  INDEX idx_next_run (next_run)
);
```

---

## Example Use Cases

### 1. GRC Compliance Assistant
```javascript
// Create agent
const agent = await createAgent({
  name: "GRC Assistant",
  systemPrompt: "You are a compliance expert...",
  tools: ["mssql-query"],
  model: { provider: "openai", name: "gpt-4o" }
});

// Execute
const result = await executeAgent(agent.id, {
  messages: [{ 
    role: "user", 
    content: "Show users with critical violations" 
  }]
});
```

### 2. Scheduled Weekly Report
```javascript
// Create schedule
const schedule = await createSchedule({
  agentId: "agent_123",
  name: "Weekly Violation Report",
  cron: "0 9 * * MON",
  input: {
    messages: [{
      role: "user",
      content: "Generate weekly SoD violation summary"
    }]
  },
  webhook: "https://myapp.com/reports"
});
```

### 3. Streaming Chat Interface
```javascript
// Stream response
const stream = await executeAgent(agentId, {
  messages: conversationHistory,
  sessionId: "session_123",
  stream: true
});

stream.on('token', (token) => {
  console.log(token.content);
});

stream.on('done', (result) => {
  console.log('Usage:', result.usage);
});
```

---

## Next Steps

1. **Implement Core APIs**: Start with agent CRUD and execution
2. **Add Authentication**: JWT middleware and tenant resolution
3. **Integrate Tools**: MCP tool registry and execution
4. **Build Session Manager**: Conversation history and memory
5. **Add Job Queue**: Async execution with webhooks
6. **Implement Scheduler**: Cron-based agent execution
7. **Add Audit System**: Comprehensive logging and metrics
8. **Build Admin UI**: Agent configuration and monitoring

---

## API Summary

| Category | Endpoints | Key Operations |
|----------|-----------|----------------|
| **Agents** | 6 | Create, list, get, update, delete, execute |
| **Sessions** | 3 | Create, get, delete |
| **Jobs** | 3 | Create, get status, cancel |
| **Schedules** | 3 | Create, get, delete |
| **Tools** | 1 | List available tools |
| **Total** | **16** | |

---

**Version**: 1.0  
**Last Updated**: 2026-01-12

