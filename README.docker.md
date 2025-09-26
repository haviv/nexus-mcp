# Docker Setup for MCP Nexus

## Prerequisites

1. Docker and Docker Compose installed
2. MCP executable built and available in `./MssqlMcp/` directory
3. Environment variables configured

## Environment Variables

Create a `.env` file with:

```env
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# MCP Configuration
MCP_SQL_COMMAND=/app/MssqlMcp/dotnet/MssqlMcp/bin/Debug/net9.0/MssqlMcp
MCP_CONNECTION_STRING=your_database_connection_string_here
MCP_NEXUS_URL=http://localhost:3000/mcp-nexus/server

# Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=your_bcrypt_hash_here
JWT_SECRET=your_jwt_secret_here

# Server Configuration
PORT=3000
NODE_ENV=production
```

## Building and Running

### Development
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build
```

### Production
```bash
# Use production configuration
docker-compose -f docker-compose.prod.yml up --build -d
```

## Services

- **Backend**: http://localhost:3000
  - Chat API: http://localhost:3000/mcp-nexus/chat
  - Auth: http://localhost:3000/auth/login
  - Health: http://localhost:3000/health

- **Frontend**: http://localhost:5173 (dev) or http://localhost:80 (prod)

## Commands

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Remove all containers and volumes
docker-compose down -v --rmi all
```

## Notes

- The backend uses Debian-based Node.js image for glibc compatibility with MCP executable
- Frontend is built with Vite and served with `serve`
- MCP executable is mounted as read-only volume
- Health checks ensure proper startup order
