@echo off
REM ============================================
REM AZMERA PLATFORM - POSTGRESQL SETUP (Windows)
REM ============================================

echo.
echo ========================================
echo Azmera Platform - PostgreSQL Setup
echo ========================================
echo.

REM Check if PostgreSQL is installed
where psql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] PostgreSQL is not installed or not in PATH
    echo.
    echo Please install PostgreSQL from:
    echo https://www.postgresql.org/download/windows/
    echo.
    pause
    exit /b 1
)

echo [OK] PostgreSQL is installed
echo.

REM Check if PostgreSQL service is running
sc query postgresql-x64-16 | find "RUNNING" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] PostgreSQL service is not running
    echo Attempting to start service...
    net start postgresql-x64-16
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to start PostgreSQL service
        echo Please start it manually from Services
        pause
        exit /b 1
    )
)

echo [OK] PostgreSQL service is running
echo.

REM Run the setup script
echo Running database setup script...
echo.
echo You will be prompted for the postgres user password
echo (This is the password you set during PostgreSQL installation)
echo.

psql -U postgres -f setup-postgresql.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo [SUCCESS] Database setup complete!
    echo ========================================
    echo.
    echo Database: azmera_db
    echo User: azmera_user
    echo Password: azmera_secure_2025
    echo.
    echo Next steps:
    echo 1. Update .env.local with connection string
    echo 2. Run: npm install pg
    echo 3. Test connection: node test-db-connection.js
    echo.
) else (
    echo.
    echo [ERROR] Database setup failed
    echo Please check the error messages above
    echo.
)

pause
