@echo off
echo.
echo  Warcraft TD - Push to GitHub
echo  =============================
echo.
git add .
git status
echo.
set /p msg="Commit message (or press Enter for 'Update game'): "
if "%msg%"=="" set msg=Update game
git commit -m "%msg%"
git push
echo.
echo  Done! Check your GitHub repo.
pause
