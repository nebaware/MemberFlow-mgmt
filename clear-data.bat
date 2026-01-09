@echo off
echo ============================================
echo Clearing All Sample Data from Database
echo ============================================
echo.
echo This will delete ALL data from the database.
echo Press Ctrl+C to cancel, or
pause
echo.
echo Running cleanup script...
echo You will be prompted for the postgres password
echo.
psql -U postgres -d azmera_db -f clear-sample-data.sql
echo.
if %ERRORLEVEL% EQU 0 (
    echo ============================================
    echo SUCCESS: All sample data cleared!
    echo ============================================
) else (
    echo ============================================
    echo ERROR: Failed to clear data
    echo ============================================
)
echo.
pause
