@echo off
echo Starting Python HTTP server on port 8000...
start http://localhost:8000/
python -m http.server 8000
pause
