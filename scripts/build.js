#!/usr/bin/env node

/**
 * Build script for Tab Timer extension
 * Copies source files to dist directory for Chrome extension
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const publicDir = path.join(__dirname, '..', 'public');
const distDir = path.join(__dirname, '..', 'dist');

// Clean dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Copy background script
const backgroundSrc = path.join(srcDir, 'background', 'background.js');
const backgroundDist = path.join(distDir, 'background.js');
if (fs.existsSync(backgroundSrc)) {
  fs.copyFileSync(backgroundSrc, backgroundDist);
  console.log('✓ Copied background.js');
}

// Copy popup files
const popupDir = path.join(distDir, 'popup');
fs.mkdirSync(popupDir, { recursive: true });

const popupHtml = path.join(srcDir, 'popup', 'popup.html');
const popupJs = path.join(srcDir, 'popup', 'popup.js');

if (fs.existsSync(popupHtml)) {
  fs.copyFileSync(popupHtml, path.join(popupDir, 'popup.html'));
  console.log('✓ Copied popup.html');
}

if (fs.existsSync(popupJs)) {
  fs.copyFileSync(popupJs, path.join(popupDir, 'popup.js'));
  console.log('✓ Copied popup.js');
}

// Copy blocked.html + blocked.js (extension internal block page)
const blockedHtml = path.join(publicDir, 'blocked.html');
if (fs.existsSync(blockedHtml)) {
  fs.copyFileSync(blockedHtml, path.join(distDir, 'blocked.html'));
  console.log('✓ Copied blocked.html');
}
const blockedJs = path.join(publicDir, 'blocked.js');
if (fs.existsSync(blockedJs)) {
  fs.copyFileSync(blockedJs, path.join(distDir, 'blocked.js'));
  console.log('✓ Copied blocked.js');
}

// Copy public files (manifest, images)
if (fs.existsSync(publicDir)) {
  // Copy manifest.json
  const manifestSrc = path.join(publicDir, 'manifest.json');
  const manifestDist = path.join(distDir, 'manifest.json');
  if (fs.existsSync(manifestSrc)) {
    // Update paths in manifest for dist structure
    let manifestContent = fs.readFileSync(manifestSrc, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    // Update paths
    manifest.background.service_worker = 'background.js';
    manifest.action.default_popup = 'popup/popup.html';
    
    fs.writeFileSync(manifestDist, JSON.stringify(manifest, null, 2));
    console.log('✓ Copied and updated manifest.json');
  }

  // Copy images
  const imagesSrc = path.join(publicDir, 'images');
  const imagesDist = path.join(distDir, 'images');
  if (fs.existsSync(imagesSrc)) {
    fs.cpSync(imagesSrc, imagesDist, { recursive: true });
    console.log('✓ Copied images');
  }
}

console.log('\n✅ Build complete! Extension files are in dist/ directory');
console.log('   Load the dist/ directory in Chrome as an unpacked extension');

