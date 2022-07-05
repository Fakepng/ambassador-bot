@echo off
echo Starting ambassador
:main
node .
echo Restarting Bot in 5 seconds...
goto main