# MCP Nexus - Full Stack AI Chat Application

A complete full-stack application featuring a Node.js backend with MCP (Model Context Protocol) integration, React frontend, and SQL Server database, all containerized with Docker.

## 🚀 Features

### Backend
- **Node.js HTTP Server**: RESTful API with TypeScript
- **AI Chat API**: Powered by Vercel AI SDK with OpenAI GPT-4o
- **MCP Integration**: Connects to SQL Server via Model Context Protocol
- **Authentication**: JWT-based login system with bcrypt password hashing
- **Streaming Responses**: Real-time streaming of AI responses
- **GRC Assistant**: Specialized in Governance, Risk, and Compliance queries

### Frontend
- **React SPA**: Modern React application with TypeScript
- **Tailwind CSS**: Beautiful, responsive UI design
- **Vercel AI SDK**: Seamless integration with backend chat API
- **Authentication UI**: Login page with JWT token management
- **Real-time Chat**: Interactive chat interface with markdown support

### Database
- **SQL Server**: Containerized SQL Server 2022 with initialization scripts
- **Sample Data**: Pre-configured with Users and ChatSessions tables
- **MCP Tools**: Database querying through MCP protocol

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   Node.js API   │    │   SQL Server    │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (Database)    │
│   Port: 5173    │    │   Port: 3000    │    │   Port: 1433    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   MCP Server    │
                    │   (MssqlMcp)    │
                    └─────────────────┘
```

## 🛠️ Prerequisites

- Docker and Docker Compose
- OpenAI API key
- MCP executable (MssqlMcp)

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone <repository-url>
cd mcp_nexus
```

### 2. Environment Configuration
```bash
# Run the setup script
./setup-env.sh

# Edit the .env file with your values
nano .env
```

Required environment variables:
```env
OPENAI_API_KEY=your_openai_api_key_here
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=your_hashed_password_here
JWT_SECRET=your_jwt_secret_here
```

### 3. Hash Your Admin Password
```bash
node -e "console.log(require('bcryptjs').hashSync('your_password', 10))"
```

### 4. Start the Application
```bash
# Development with hot reloading
docker-compose up --build

# Production
docker-compose -f docker-compose.prod.yml up --build
```

### 5. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **SQL Server**: localhost:1433

## 📡 API Endpoints

### Authentication
- **POST** `/auth/login` - User login
  ```json
  {
    "username": "admin",
    "password": "your_password"
  }
  ```

### Chat API (Protected)
- **POST** `/mcp-nexus/chat` - Send messages to AI assistant
  ```json
  {
    "messages": [
      {
        "role": "user",
        "parts": [
          {
            "type": "text",
            "text": "Show me users with the most violations"
          }
        ]
      }
    ]
  }
  ```

### MCP Server
- **POST** `/mcp-nexus/server` - MCP server endpoint for tool handling

### Health Check
- **GET** `/health` - Server health status

## 🐳 Docker Services

### Backend Service
- **Image**: Custom Node.js with MCP support
- **Platform**: linux/amd64 (for MCP executable compatibility)
- **Dependencies**: libicu72 for .NET runtime support
- **Volume**: MCP executable mounted from host

### Frontend Service
- **Image**: React app built with Vite
- **Port**: 5173 (development) / 80 (production)
- **Build**: Multi-stage Docker build for optimization

### SQL Server Service
- **Image**: Microsoft SQL Server 2022
- **Database**: MCPNexus (auto-initialized)
- **Tools**: MSSQL tools and dependencies included
- **Volume**: Persistent data storage

## 🔧 Development

### Local Development (without Docker)
```bash
# Backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### Docker Development
```bash
# Start all services
docker-compose up --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Database Management
```bash
# Connect to SQL Server
docker exec -it mcp-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong!Passw0rd"

# View database
USE MCPNexus;
SELECT * FROM Users;
```

## 📁 Project Structure

```
mcp_nexus/
├── src/                    # Backend source code
│   ├── server.ts          # Main server file
│   └── config/            # Configuration files
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   └── App.tsx        # Main app component
│   └── Dockerfile
├── docker-compose.yml     # Development setup
├── docker-compose.prod.yml # Production setup
├── Dockerfile.backend     # Backend container
├── Dockerfile.sqlserver   # SQL Server container
└── init-db.sql           # Database initialization
```

## 🔐 Security

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **CORS Configuration**: Proper cross-origin setup
- **Environment Variables**: Sensitive data in environment files

## 🚀 Deployment

### Production Deployment
```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up --build -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### Environment Variables for Production
Ensure all production environment variables are properly set:
- `OPENAI_API_KEY`
- `ADMIN_PASSWORD_HASH`
- `JWT_SECRET`
- `MCP_CONNECTION_STRING`

## 🐛 Troubleshooting

### Common Issues

1. **MCP Executable Not Found**
   - Ensure the MCP executable path is correct in docker-compose.yml
   - Check that the executable has proper permissions

2. **Database Connection Issues**
   - Verify SQL Server is running: `docker-compose ps`
   - Check connection string format
   - Ensure database is initialized

3. **Authentication Issues**
   - Verify password hash is correct
   - Check JWT secret is set
   - Ensure admin user exists

### Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs sqlserver
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review Docker logs
3. Open an issue on GitHub