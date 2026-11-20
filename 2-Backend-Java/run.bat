@echo off
setlocal
set PORT=8080
set DBUSER=root
set DBPASS=root

if not "%~1"=="" set DBPASS=%~1
if not "%~2"=="" set DBUSER=%~2
if not "%~3"=="" set PORT=%~3

echo Starting Smart Inventory Backend Server...
echo Database User: %DBUSER%
echo Port: %PORT%
echo.

java -cp "bin;lib/mysql-connector-j-9.1.0.jar" com.inventory.MainServer %PORT% %DBUSER% %DBPASS%
