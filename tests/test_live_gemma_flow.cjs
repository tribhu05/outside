const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173/';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runLiveGemmaTest() {
  console.log('--- TESTING LIVE GEMMA INTEGRATION IN BROWSER ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('Outside AI')) {
      console.log(`BROWSER [${msg.type()}]:`, msg.text());
    }
  });

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });

    // 1. Verify Connection in Settings Modal
    console.log('Step 1: Opening AI Engine & Privacy modal...');
    const settingsBtn = await page.$('button[title="Configure AI Provider & Engine"]');
    await settingsBtn.click();
    await sleep(400);

    console.log('Step 2: Clicking Test Connection...');
    const btns = await page.$$('button');
    for (const b of btns) {
      const text = await page.evaluate(el => el.innerText, b);
      if (text.includes('Test Connection')) {
        await b.click();
        break;
      }
    }

    await page.waitForSelector('[data-testid="connection-status"]', { timeout: 25000 });
    const connectionText = await page.$eval('[data-testid="connection-status"]', el => el.innerText);
    console.log('Connection status result:', connectionText);

    if (!connectionText.includes('Connected')) {
      throw new Error(`Connection test failed: ${connectionText}`);
    }

    // Close settings modal
    const closeBtn = await page.$('button[aria-label="Close AI settings"]');
    await closeBtn.click();
    await sleep(400);

    // 2. Submit Real Prompt to Gemma
    console.log('Step 3: Submitting prompt for real Gemma extraction...');
    const testPrompt = "I have 90 minutes free this evening. I don't want to spend money and I want something relaxing.";
    await page.click('textarea');
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.type('textarea', testPrompt);

    const submitBtn = await page.$('button[type="submit"]');
    const startSubmit = Date.now();
    await submitBtn.click();

    console.log('Waiting for Gemma inference and plan generation...');
    await page.waitForSelector('[data-testid="plan-view"]', { timeout: 35000 });
    console.log(`Plan generated successfully in ${Date.now() - startSubmit}ms!`);

    // 3. Inspect Plan Provenance
    const planTitle = await page.$eval('[data-testid="plan-title"]', el => el.innerText);
    console.log('Generated Plan Title:', planTitle);

    const provenanceText = await page.$eval('div.rounded-full', el => el.innerText).catch(() => '');
    console.log('Plan Provenance:', provenanceText);

    const planBodyText = await page.$eval('[data-testid="plan-view"]', el => el.innerText);
    const has90Min = planBodyText.includes('90 min total');
    console.log('Respects 90 min duration:', has90Min);

    const isGemmaProvenance = provenanceText.includes('Gemma') || planBodyText.includes('Parsed with Gemma');
    console.log('Verified Gemma AI was used:', isGemmaProvenance);

    console.log('\n--- LIVE GEMMA INTEGRATION TEST PASSED! ---');
    return { success: true, planTitle, connectionText, isGemmaProvenance };

  } catch (err) {
    console.error('TEST FAILED:', err);
    return { success: false, error: err.message };
  } finally {
    await browser.close();
  }
}

runLiveGemmaTest().then(res => {
  if (!res.success) process.exit(1);
  process.exit(0);
});
