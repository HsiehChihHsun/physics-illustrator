@echo off
:: Batch script to push changes to GitHub
:: Repo: https://github.com/HsiehChihHsun/physics-illustrator

cd /d "%~dp0"

echo ========================================
echo Adding all files to git...
git add .

echo ========================================
echo Committing changes...
set "timestamp=%date% %time%"
git commit -m "Auto-update V10: %timestamp%"

echo ========================================
echo Pushing to remote repository...
git push origin main

echo ========================================
echo Done!
pause
