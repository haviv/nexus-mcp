-- Initialize database for MCP Nexus
USE master;
GO

-- Create database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'MCPNexus')
BEGIN
    CREATE DATABASE MCPNexus;
END
GO

USE MCPNexus;
GO

-- Create a sample table for testing
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
BEGIN
    CREATE TABLE Users (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Username NVARCHAR(50) NOT NULL,
        Email NVARCHAR(100) NOT NULL,
        CreatedAt DATETIME2 DEFAULT GETDATE()
    );
END
GO

-- Insert sample data
IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'admin')
BEGIN
    INSERT INTO Users (Username, Email) VALUES ('admin', 'admin@example.com');
END
GO

-- Create another sample table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ChatSessions' AND xtype='U')
BEGIN
    CREATE TABLE ChatSessions (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT,
        Message NVARCHAR(MAX),
        Response NVARCHAR(MAX),
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (UserId) REFERENCES Users(Id)
    );
END
GO

PRINT 'Database initialization completed successfully!';
