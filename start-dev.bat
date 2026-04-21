@echo off
setlocal enabledelayedexpansion

REM Colors
set GREEN=[92m
set RED=[91m
set YELLOW=[93m
set BLUE=[94m
set NC=[0m

echo %BLUE%=====================================================%NC%
echo %BLUE%TODO PRODUCTIVITY SUITE - LOCAL DEVELOPMENT%NC%
echo %BLUE%=====================================================%NC%
echo.

REM Check requirements
echo %BLUE%Checking requirements...%NC%
where node >/dev/null 2>/dev/null || (
    echo %RED%Node.js not found. Install from https://nodejs.org%NC%
    exit /b 1
)
echo %GREEN%✓ Node.js found%NC%

where java >/dev/null 2>/dev/null || (
    echo %RED%Java not found. Install Java 21+%NC%
    exit /b 1
)
echo %GREEN%✓ Java found%NC%

where mvn >/dev/null 2>/dev/null || (
    echo %RED%Maven not found. Install from https://maven.apache.org%NC%
    exit /b 1
)
echo %GREEN%✓ Maven found%NC%
echo.

REM Database setup
echo %BLUE%Setting up database...%NC%
where docker >/dev/null 2>/dev/null && (
    docker ps | findstr todo-postgres >/dev/null || (
        echo %GREEN%Starting PostgreSQL...%NC%
        docker run -d --name todo-postgres -e POSTGRES_USER=todo_user -e POSTGRES_PASSWORD=todo_password -e POSTGRES_DB=todo_db -p 5432:5432 postgres:16-alpine
        timeout /t 5 /nobreak
    )
) || (
    echo %YELLOW%Docker not found - ensure PostgreSQL is running on localhost:5432%NC%
)
echo.

REM Start services
echo %BLUE%Starting Backend...%NC%
start "Backend" cmd /k "cd deployments\Backend && mvn spring-boot:run"
timeout /t 5 /nobreak

echo %BLUE%Starting Middleware...%NC%
start "Middleware" cmd /k "cd deployments\Middleware && npm install && npm run dev"
timeout /t 3 /nobreak

echo %BLUE%Starting UI...%NC%
start "UI" cmd /k "cd deployments\UI && npm install && npm run dev"

echo.
echo %GREEN%=====================================================%NC%
echo %GREEN%All services started successfully!%NC%
echo %GREEN%=====================================================%NC%
echo.
echo %GREEN%Frontend:   http://localhost:3002%NC%
echo %GREEN%Middleware: http://localhost:3001%NC%
echo %GREEN%Backend:    http://localhost:8080/api%NC%
echo.
echo %YELLOW%Press Ctrl+C in each window to stop services%NC%

endlocal
