@echo off
echo ==========================================================
echo Compiling Smart Inventory Java Backend and Terminal CLI
echo ==========================================================

if not exist bin mkdir bin

javac -encoding UTF-8 -cp "lib/mysql-connector-j-9.1.0.jar" -d bin src\com\inventory\model\*.java src\com\inventory\exception\*.java src\com\inventory\dao\*.java src\com\inventory\service\*.java src\com\inventory\controller\*.java src\com\inventory\MainServer.java src\com\inventory\InventoryTerminalApp.java

if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Compilation finished without errors!
    echo Compiled classes are in the 'bin' directory.
) else (
    echo [ERROR] Compilation failed. Please check the error messages above.
)
