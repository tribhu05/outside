const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173/';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function capture() {
  console.log('Capturing high-resolution screenshots for Outside README...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });

  try {
    // 1. Landing Screen
    console.log('1. Capturing 01-input.png...');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(1500);
    await page.screenshot({ path: path.join(__dirname, '../docs/screenshots/01-input.png') });

    // 2. Plan Screen
    console.log('2. Generating plan and capturing 02-plan.png...');
    // Click one of the example suggestions for a clean prompt
    const firstExample = await page.$('div.grid button');
    if (firstExample) {
      await firstExample.click();
      await sleep(300);
    }
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
    }
    await page.waitForSelector('[data-testid="plan-view"]', { timeout: 35000 });
    await sleep(1000);
    await page.screenshot({ path: path.join(__dirname, '../docs/screenshots/02-plan.png') });

    // 3. Screen Exit Mode
    console.log('3. Starting session and capturing 03-screen-exit.png...');
    const startBtn = await page.$eval('button', () => {
      const btns = Array.from(document.querySelectorAll('button'));
      const found = btns.find(b => b.innerText.includes('Start Outside Time'));
      if (found) { found.click(); return true; }
      return false;
    });
    await sleep(1200);
    await page.screenshot({ path: path.join(__dirname, '../docs/screenshots/03-screen-exit.png') });

    // 4. Return, reflect, and show History Log
    console.log('4. Completing session and capturing 04-history.png...');
    await page.$$eval('button', btns => {
      const b = btns.find(btn => btn.innerText.includes("I'm Back / Done Outside") || btn.innerText.includes("Done Outside"));
      if (b) b.click();
    });
    await sleep(800);
    
    // Select a mood in reflection modal
    await page.$$eval('button', btns => {
      const b = btns.find(btn => btn.innerText.includes('Better'));
      if (b) b.click();
    });
    await sleep(300);

    // Save reflection
    await page.$$eval('button', btns => {
      const b = btns.find(btn => btn.innerText.includes('Save to Log') || btn.innerText.includes('Save'));
      if (b) b.click();
    });
    await sleep(800);

    // Open History Log
    await page.$$eval('button', btns => {
      const b = btns.find(btn => btn.innerText.includes('Local Log') || btn.title?.includes('History'));
      if (b) b.click();
    });
    await sleep(800);
    await page.screenshot({ path: path.join(__dirname, '../docs/screenshots/04-history.png') });

    console.log('✅ All screenshots captured successfully in docs/screenshots/');
  } catch (err) {
    console.error('Error capturing screenshots:', err);
  } finally {
    await browser.close();
  }
}

capture();
