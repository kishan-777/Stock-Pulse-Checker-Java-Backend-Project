@echo off
setlocal
set DBUSER=root
set DBPASS=root

if not "%~1"=="" set DBPASS=%~1
if not "%~2"=="" set DBUSER=%~2

echo Starting Smart Inventory Terminal / CLI Application...
echo.

java -cp "bin;lib/mysql-connector-j-9.1.0.jar" com.inventory.InventoryTerminalApp
