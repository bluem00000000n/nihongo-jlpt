#!/usr/bin/env bash
echo "========================================================"
echo "  nihongo-jlpt (日本語) - AI 일본어 회화 및 1급 합격 학습기"
echo "========================================================"
echo ""
echo "[1/2] 브라우저를 열고 개발 서버를 시작합니다..."
(sleep 2 && open "http://localhost:3000" 2>/dev/null || xdg-open "http://localhost:3000" 2>/dev/null) &
npm run dev
