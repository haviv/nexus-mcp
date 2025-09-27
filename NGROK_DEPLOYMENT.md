# Ngrok Deployment Guide

This guide explains how to deploy the MCP Nexus application using Docker Compose and expose it via ngrok.

## Architecture

```
Internet → ngrok → nginx (port 80) → backend (port 5000)
                    ↓
                frontend (built into nginx)
```

## Setup Instructions

### 1. Build and Start Services

```bash
# Build and start all services
docker-compose up --build

# Or for production
docker-compose -f docker-compose.prod.yml up --build
```

### 2. Expose via Ngrok

```bash
# Install ngrok if not already installed
# https://ngrok.com/download

# Expose port 80 (nginx service)
ngrok http 80
```

### 3. Configure Environment Variables

Make sure your `.env` file has the correct settings:

```bash
# Backend configuration
PORT=5000
MCP_NEXUS_URL=http://backend:5000/mcp-nexus/server

# Admin credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=your_bcrypt_hash_here
JWT_SECRET=your_jwt_secret_here

# OpenAI API key
OPENAI_API_KEY=your_openai_api_key_here
```

## How It Works

### Request Flow

1. **Frontend Requests**: User visits `https://your-ngrok-url.ngrok-free.app`
2. **Static Files**: nginx serves the React frontend (built into the nginx container)
3. **API Requests**: When frontend makes API calls to `/auth/login` or `/mcp-nexus/chat`:
   - nginx proxies these requests to the backend service
   - Backend processes the request and returns response
   - nginx forwards the response back to the frontend

### Nginx Configuration

The `nginx.conf` file handles:
- **Static file serving**: Serves the React app from `/`
- **API proxying**: Routes `/auth/*` and `/mcp-nexus/*` to backend
- **Health checks**: Routes `/health` to backend

### Frontend Configuration

The frontend uses relative URLs:
- `VITE_API_URL=/mcp-nexus/chat` (relative URL)
- Login calls go to `/auth/login` (relative URL)
- All API calls are automatically proxied by nginx

## Testing

### 1. Test the Setup

```bash
# Check if services are running
docker-compose ps

# Test nginx is serving frontend
curl http://localhost:80

# Test API proxying
curl http://localhost:80/health
```

### 2. Test via Ngrok

```bash
# Get your ngrok URL (e.g., https://abc123.ngrok-free.app)
# Test frontend
curl https://abc123.ngrok-free.app

# Test API
curl https://abc123.ngrok-free.app/health
```

### 3. Test Authentication

```bash
# Test login endpoint
curl -X POST https://your-ngrok-url.ngrok-free.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}'
```

## Troubleshooting

### Common Issues

1. **Frontend shows HTML instead of API response**:
   - Check nginx configuration
   - Ensure backend is running on port 5000
   - Verify nginx is proxying correctly

2. **CORS errors**:
   - nginx handles CORS by proxying requests
   - Backend should have CORS headers configured

3. **Authentication fails**:
   - Check JWT token storage/retrieval
   - Verify backend is receiving requests
   - Check nginx logs: `docker-compose logs nginx`

### Debug Commands

```bash
# Check nginx logs
docker-compose logs nginx

# Check backend logs
docker-compose logs backend

# Test nginx configuration
docker-compose exec nginx nginx -t

# Restart services
docker-compose restart nginx backend
```

## Production Considerations

1. **Security**: Use HTTPS in production
2. **Environment Variables**: Set proper JWT secrets and passwords
3. **Database**: Configure proper database connection
4. **Monitoring**: Set up logging and monitoring
5. **Scaling**: Consider load balancing for multiple instances

## Example Ngrok Setup

```bash
# Start the application
docker-compose up -d

# In another terminal, start ngrok
ngrok http 80

# Your application will be available at:
# https://abc123.ngrok-free.app
```

The frontend will automatically use the correct API endpoints through the nginx proxy, and all authentication will work correctly through the ngrok tunnel.
