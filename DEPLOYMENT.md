# Deployment Configuration

This document explains how to configure the MCP Nexus application for different deployment scenarios.

## Environment Variables

### Backend (.env in root directory)

```bash
# Server Configuration
PORT=4000
MCP_NEXUS_URL=http://localhost:4000/mcp-nexus/server

# Admin User Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=your_bcrypt_hash_here
JWT_SECRET=your_jwt_secret_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
```

### Frontend (frontend/.env)

#### Local Development
When running frontend on port 5173 and backend on port 4000:
```bash
VITE_API_URL=http://localhost:4000/mcp-nexus/chat
```

#### Production - Same Domain
When frontend and backend are served from the same domain:
```bash
VITE_API_URL=/mcp-nexus/chat
```

#### Production - Different Domains
When frontend and backend are on different domains:
```bash
VITE_API_URL=https://your-backend-domain.com/mcp-nexus/chat
```

## Deployment Scenarios

### 1. Local Development
- Backend: `http://localhost:4000`
- Frontend: `http://localhost:5173`
- Frontend .env: `VITE_API_URL=http://localhost:4000/mcp-nexus/chat`

### 2. Production with Reverse Proxy
- Both frontend and backend served from same domain
- Frontend .env: `VITE_API_URL=/mcp-nexus/chat`
- Example nginx config:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}

location /mcp-nexus/ {
    proxy_pass http://localhost:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

### 3. Production with Separate Domains
- Frontend: `https://app.yourdomain.com`
- Backend: `https://api.yourdomain.com`
- Frontend .env: `VITE_API_URL=https://api.yourdomain.com/mcp-nexus/chat`

## Docker Compose Configuration

### Development (docker-compose.yml)
```yaml
services:
  backend:
    ports:
      - "4000:4000"
    environment:
      - PORT=4000
      - MCP_NEXUS_URL=http://backend:4000/mcp-nexus/server
  
  frontend:
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:4000/mcp-nexus/chat
```

### Production (docker-compose.prod.yml)
```yaml
services:
  backend:
    ports:
      - "4000:4000"
    environment:
      - PORT=4000
      - MCP_NEXUS_URL=http://backend:4000/mcp-nexus/server
  
  frontend:
    ports:
      - "80:5173"
    environment:
      - VITE_API_URL=http://localhost:4000/mcp-nexus/chat
```

## Testing

Test the configuration by checking these endpoints:

```bash
# Health check
curl http://localhost:4000/health

# Auth endpoint (should return 401 without valid credentials)
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'

# MCP server endpoint
curl -X POST http://localhost:4000/mcp-nexus/server \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"ping","id":1}'
```
