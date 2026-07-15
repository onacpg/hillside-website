import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(ROOT, 'temporary screenshots');

// Ensure output directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Auto-increment filename: screenshot-N[-label].png
function nextFilename(label) {
  const existing = fs.existsSync(SCREENSHOTS_DIR)
    ? fs.readdirSync(SCREENSHOTS_DIR).filter(f => f.endsWith('.png'))
    : [];
  const nums = existing
    .map(f => parseInt(f.match(/^screenshot-(\d+)/)?.[1] ?? '0'))
    .filter(n => !isNaN(n));
  const n = nums.length ? Math.max(...nums) + 1 : 1;
  return label
    ? `screenshot-${n}-${label}.png`
    : `screenshot-${n}.png`;
}

const url   = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page    = await browser.newPage();

await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

const filename = nextFilename(label);
const outPath  = path.join(SCREENSHOTS_DIR, filename);

await page.screenshot({ path: outPath, fullPage: true });
await browser.close();

console.log(`Saved → temporary screenshots/${filename}`);
