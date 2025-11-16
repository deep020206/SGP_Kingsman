@echo off
echo ====================================
echo    Kingsman Network Configuration
echo ====================================
echo.

echo Finding your IP address...
echo.

for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
    for /f "tokens=1 delims= " %%j in ("%%i") do (
        echo Your IP Address: %%j
        set IP=%%j
    )
)

echo.
echo ====================================
echo    Configuration Instructions
echo ====================================
echo.
echo To access Kingsman from other devices on your network:
echo.
echo 1. Update Frontend/.env file:
echo    REACT_APP_API_URL=http://%IP%:5000/api
echo    REACT_APP_SERVER_URL=http://%IP%:5000
echo    REACT_APP_SOCKET_URL=http://%IP%:5000
echo.
echo 2. Make sure Windows Firewall allows:
echo    - Port 3000 (Frontend)
echo    - Port 5000 (Backend)
echo.
echo 3. Start both servers:
echo    Backend: cd Backend ^&^& npm start
echo    Frontend: cd Frontend ^&^& npm start
echo.
echo 4. Access from other devices using:
echo    http://%IP%:3000
echo.
echo ====================================
pause