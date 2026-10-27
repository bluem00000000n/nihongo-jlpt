@echo off
chcp 65001 > nul
echo ========================================================
echo   nihongo (日本語) - AI 일본어 회화 및 1급 합격 학습기
echo ========================================================
echo.
echo [1/2] 개발 서버를 시작합니다...
start "" "http://localhost:3000"
npm run dev
pause
