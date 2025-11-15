#!/bin/bash

# Chrome Web Store 이미지 준비 스크립트

echo "📸 Chrome Web Store 이미지 준비 스크립트"
echo "=========================================="

# ImageMagick이 설치되어 있는지 확인
if ! command -v convert &> /dev/null; then
    echo "⚠️  ImageMagick이 설치되어 있지 않습니다."
    echo "설치: sudo apt-get install imagemagick"
    exit 1
fi

STORE_DIR="images/store"
mkdir -p "$STORE_DIR"

echo ""
echo "✅ 프로모션 타일 확인:"
ls -lh "$STORE_DIR"/promo*.png 2>/dev/null || echo "프로모션 타일이 없습니다."

echo ""
echo "📋 필요한 스크린샷:"
echo "1. 메인 팝업 화면 (라이트 모드) - 1280x800"
echo "2. 다크 모드 화면 - 1280x800"
echo "3. 대시보드 화면 - 1280x800"
echo "4. 사이트 리스트 화면 - 1280x800"
echo "5. 설정 화면 - 1280x800"

echo ""
echo "💡 스크린샷 캡처 후 이 스크립트로 크기 조정:"
echo "   ./scripts/prepare-store-images.sh resize <screenshot.png>"
echo ""

# 크기 조정 함수
if [ "$1" == "resize" ] && [ -n "$2" ]; then
    INPUT="$2"
    OUTPUT="${INPUT%.*}-1280x800.png"
    
    echo "🔄 크기 조정 중: $INPUT -> $OUTPUT"
    convert "$INPUT" -resize 1280x800 -background white -alpha remove "$OUTPUT"
    echo "✅ 완료: $OUTPUT"
fi

