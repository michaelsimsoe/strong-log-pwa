#!/usr/bin/env node

// This script generates PNG icons from the SVG icon for the PWA
// It requires sharp to be installed: pnpm add -D sharp

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure the script works with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if sharp is installed
try {
  const sharp = (await import('sharp')).default;

  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
  const svgPath = path.join(__dirname, '../public/icons/icon.svg');
  const iconDir = path.join(__dirname, '../public/icons');

  // Ensure the icons directory exists
  if (!fs.existsSync(iconDir)) {
    fs.mkdirSync(iconDir, { recursive: true });
  }

  // Read the SVG file
  const svgBuffer = fs.readFileSync(svgPath);

  // Generate icons for each size
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(iconDir, `icon-${size}x${size}.png`));

    console.log(`Generated icon-${size}x${size}.png`);
  }

  // Generate a maskable icon (with padding for safe area)
  await sharp(svgBuffer)
    .resize(512, 512, {
      fit: 'contain',
      background: { r: 74, g: 85, b: 104, alpha: 1 }, // Same as the background color in the SVG
    })
    .png()
    .toFile(path.join(iconDir, 'maskable-icon-512x512.png'));

  console.log('Generated maskable-icon-512x512.png');

  console.log('All icons generated successfully!');
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.error('Error: sharp module is not installed.');
    console.error('Please install it with: pnpm add -D sharp');
  } else {
    console.error('Error generating icons:', error);
  }
  process.exit(1);
}
