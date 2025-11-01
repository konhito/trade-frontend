@echo off
echo Pushing schema to database...
echo.

npx prisma db push --accept-data-loss --skip-generate

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Success! Database updated.
    echo Restart your dev server to see changes.
) else (
    echo.
    echo Failed to push schema.
    echo Make sure your dev server is stopped.
)

pause

