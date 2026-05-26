import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';
import { resolve } from 'path';

const OUTPUT = resolve('screenshots');
mkdirSync(OUTPUT, { recursive: true });

const PAGES = [
  { name: '01_landing',   path: '/' },
  { name: '02_dashboard', path: '/dashboard' },
  { name: '03_upload',    path: '/upload' },
  { name: '04_results',   path: '/results' },
  { name: '05_settings',  path: '/settings' },
];

const WIDTH = 1440;
const HEIGHT = 900;

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    defaultViewport: { width: WIDTH, height: HEIGHT },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  for (const page of PAGES) {
    const tab = await browser.newPage();
    const url = `http://localhost:3000${page.path}`;
    console.log(`Capturing ${url} ...`);

    await tab.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
    // Wait for framer-motion animations to settle
    await new Promise(r => setTimeout(r, 2000));

    await tab.screenshot({
      path: `${OUTPUT}/${page.name}.png`,
      fullPage: true,
    });
    console.log(`  -> saved ${page.name}.png`);
    await tab.close();
  }

  await browser.close();
  console.log('\nDone! Screenshots saved to ./screenshots/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
