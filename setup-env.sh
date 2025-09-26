#!/bin/bash

# Setup script for MCP Nexus environment variables

echo "Setting up MCP Nexus environment..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# OpenAI API Key (required)
OPENAI_API_KEY=your_openai_api_key_here

# Admin User Configuration (required)
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=
JWT_SECRET=dev-secret-change-me

# Optional: Override default values
# MCP_CONNECTION_STRING=Server=sqlserver,1433;Database=MCPNexus;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=true;
# MCP_NEXUS_URL=http://backend:3000/mcp-nexus/server
EOF
    echo "✅ Created .env file"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "📝 Please edit the .env file and set your actual values:"
echo "   - OPENAI_API_KEY: Your OpenAI API key"
echo "   - ADMIN_PASSWORD_HASH: Hash your admin password with bcrypt"
echo "   - JWT_SECRET: A secure secret for JWT tokens"
echo ""
echo "🔐 To hash your admin password, run:"
echo "   node -e \"console.log(require('bcryptjs').hashSync('your_password', 10))\""
echo ""
echo "🚀 Then start with: docker-compose up --build"
