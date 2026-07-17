#!/bin/bash
echo ""
echo " Warcraft TD - Push to GitHub"
echo " ============================="
echo ""
git add .
git status
echo ""
read -p "Commit message (Enter for 'Update game'): " msg
msg=${msg:-"Update game"}
git commit -m "$msg"
git push
echo ""
echo " Done! Check your GitHub repo."
