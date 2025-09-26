#!/bin/bash

# Simplified SQL Server startup script with database initialization

echo "Starting SQL Server with initialization..."

# Start SQL Server in the background
/opt/mssql/bin/sqlservr &
SERVER_PID=$!

# Wait for SQL Server to be ready
echo "Waiting for SQL Server to start..."
for i in {1..50}; do
    sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -C -Q "SELECT 1" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "SQL Server is ready!"
        break
    fi
    echo "Waiting for SQL Server... ($i/50)"
    sleep 2
done

# Run the initialization script
if [ -f /docker-entrypoint-initdb.d/init-db.sql ]; then
    echo "Running database initialization script..."
    sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -C -i /docker-entrypoint-initdb.d/init-db.sql
    if [ $? -eq 0 ]; then
        echo "Database initialization completed successfully!"
        echo "profiletailor database is ready for MCP operations."
    else
        echo "Database initialization failed!"
    fi
else
    echo "No initialization script found, skipping database setup."
fi

# Keep the container running by waiting for the SQL Server process
echo "SQL Server is ready and initialized. Container will stay alive."
wait $SERVER_PID
