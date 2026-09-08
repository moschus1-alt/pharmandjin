@echo off
cd /d "%~dp0"
set "PJ_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%PJ_NODE%" set "PJ_NODE=node"
start "" "http://127.0.0.1:8787"
"%PJ_NODE%" server.mjs
pause
