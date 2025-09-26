#!/bin/bash

# SQL Server startup script with database initialization
# This script runs the SQL Server and then executes the init script

echo "Starting SQL Server..."

# Start SQL Server in the background
/opt/mssql/bin/sqlservr &

# Wait for SQL Server to be ready
echo "Waiting for SQL Server to start..."
for i in {1..50}; do
    # Try to connect using sqlcmd (if available) or fallback method
    if command -v /opt/mssql-tools18/bin/sqlcmd >/dev/null 2>&1; then
        /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -C -Q "SELECT 1" > /dev/null 2>&1
    elif command -v /opt/mssql-tools/bin/sqlcmd >/dev/null 2>&1; then
        /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -Q "SELECT 1" > /dev/null 2>&1
    else
        # Fallback: check if SQL Server is listening on port 1433
        nc -z localhost 1433 > /dev/null 2>&1
    fi
    
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
    
    # Try different sqlcmd paths
    SQLCMD_PATH=""
    if command -v /opt/mssql-tools18/bin/sqlcmd >/dev/null 2>&1; then
        SQLCMD_PATH="/opt/mssql-tools18/bin/sqlcmd -C"
    elif command -v /opt/mssql-tools/bin/sqlcmd >/dev/null 2>&1; then
        SQLCMD_PATH="/opt/mssql-tools/bin/sqlcmd"
    else
        echo "sqlcmd not found. Installing mssql-tools..."
        # Install mssql-tools
        curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add -
        curl https://packages.microsoft.com/config/ubuntu/22.04/prod.list > /etc/apt/sources.list.d/msprod.list
        apt-get update && ACCEPT_EULA=Y apt-get install -y mssql-tools18
        SQLCMD_PATH="/opt/mssql-tools18/bin/sqlcmd -C"
    fi
    
    if [ -n "$SQLCMD_PATH" ]; then
        $SQLCMD_PATH -S localhost -U sa -P "$SA_PASSWORD" -i /docker-entrypoint-initdb.d/init-db.sql
        if [ $? -eq 0 ]; then
            echo "Database initialization completed successfully!"
        else
            echo "Database initialization failed!"
        fi
    else
        echo "Could not find or install sqlcmd. Skipping database initialization."
    fi
else
    echo "No initialization script found, skipping database setup."
fi

# Keep the container running
echo "SQL Server is ready and initialized. Keeping container alive..."
wait
