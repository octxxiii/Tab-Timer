#!/usr/bin/env node

/**
 * SVG to PNG Converter
 * Converts SVG files to PNG format
 */

const fs = require('fs');
const path = require('path');

// Try to use sharp if available, otherwise use fallback method
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('sharp가 설치되어 있지 않습니다. 설치 중...');
  console.log('npm install sharp --save-dev');
  process.exit(1);
}

async function convertSvgToPng(inputPath, outputPath, width = null, height = null) {
  try {
    const inputBuffer = fs.readFileSync(inputPath);
    
    let sharpInstance = sharp(inputBuffer);
    
    // 알파 채널 제거 (24비트 PNG 요구사항)
    sharpInstance = sharpInstance.removeAlpha();
    
    if (width || height) {
      sharpInstance = sharpInstance.resize(width, height, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      });
    }
    
    // 24비트 PNG로 저장 (알파 채널 없음)
    await sharpInstance
      .png({ compressionLevel: 9 })
      .toFile(outputPath);
    console.log(`✅ 변환 완료: ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`❌ 변환 실패: ${error.message}`);
    return false;
  }
}

// Main execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('사용법: node svg-to-png.js <svg-file> [output-file] [width] [height]');
  process.exit(1);
}

const inputFile = args[0];
const outputFile = args[1] || inputFile.replace(/\.(svg|png|jpg|jpeg)$/i, '.png');
const width = args[2] ? parseInt(args[2]) : null;
const height = args[3] ? parseInt(args[3]) : null;

if (!fs.existsSync(inputFile)) {
  console.error(`❌ 파일을 찾을 수 없습니다: ${inputFile}`);
  process.exit(1);
}

convertSvgToPng(inputFile, outputFile, width, height)
  .then(success => {
    if (success) {
      console.log(`\n✅ 완료! PNG 파일: ${outputFile}`);
    } else {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('오류:', error);
    process.exit(1);
  });

