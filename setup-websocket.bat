@echo off
echo ========================================
echo   Installing WebSocket (Socket.IO)
echo ========================================
echo.

echo [1/2] Installing server packages...
cd server
call npm install socket.io
echo.

echo [2/2] Installing client packages...
cd ..\client
call npm install socket.io-client
echo.

echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Restart your server (npm run dev)
echo 2. Restart your client (npm run dev)
echo 3. Test real-time messaging!
echo.
echo See LIVE_COMMUNICATION_GUIDE.md for details
echo.
pause
