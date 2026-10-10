const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173/';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runE2ETests() {
  console.log('--- STARTING E2E BROWSER TESTING FOR OUTSIDE ---');
  console.log(`Connecting to Chrome at: ${CHROME_PATH}`);
  console.log(`Target URL: ${BASE_URL}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--autoplay-policy=no-user-gesture-required'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const consoleLogs = [];
  const errors = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push({ type: msg.type(), text });
    if (msg.type() === 'error') {
      if (!text.includes('ERR_CONNECTION_REFUSED') && !text.includes('11434')) {
        errors.push(`Console error: ${text}`);
      }
    }
  });

  page.on('pageerror', err => {
    errors.push(`Page error: ${err.message}`);
  });

  const testResults = [];
  function recordTest(name, passed, details = '') {
    testResults.push({ name, passed, details });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${mark}: ${name} ${details ? '(' + details + ')' : ''}`);
  }

  try {
    // ==========================================
    // Phase 2, Test A: Application Loading
    // ==========================================
    console.log('\n--- Test A: Application Loading ---');
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 10000 });

    const title = await page.title();
    recordTest('Page Title', title.includes('Outside'), `Title: "${title}"`);

    const headerBrand = await page.$eval('header', el => el.innerText).catch(() => '');
    recordTest('Header rendered', headerBrand.includes('Outside') && headerBrand.includes('Touch Grass'));

    const headingText = await page.$eval('h1', el => el.innerText).catch(() => '');
    recordTest('Main Heading', headingText.includes('What do you feel like doing outside?'));

    const textareaExists = await page.$('textarea');
    recordTest('Textarea exists and visible', !!textareaExists);

    // Check examples rendered
    const exampleButtons = await page.$$('button[type="button"]');
    recordTest('Quick suggestion buttons exist', exampleButtons.length >= 4, `Found ${exampleButtons.length} buttons`);

    // ==========================================
    // Phase 2, Test B: Prompt and Plan Generation
    // ==========================================
    console.log('\n--- Test B: Prompt & Plan Generation ---');

    // 1. Test clicking all quick suggestion buttons
    const exampleTexts = await page.$$eval('div.grid button', btns => btns.map(b => b.innerText.replace(/[“”"]/g, '').trim()));
    console.log(`Found ${exampleTexts.length} example prompts`);

    let allExamplesWorked = true;
    for (let i = 0; i < Math.min(exampleTexts.length, 6); i++) {
      const btnSelector = `div.grid button:nth-child(${i + 1})`;
      await page.click(btnSelector);
      await sleep(100);
      const val = await page.$eval('textarea', el => el.value);
      if (!val.includes(exampleTexts[i].slice(0, 20))) {
        allExamplesWorked = false;
        console.error(`Example ${i + 1} failed to populate. Expected "${exampleTexts[i]}", got "${val}"`);
      }
    }
    recordTest('All quick suggestions populate input', allExamplesWorked);

    // 2. Test Empty input submission
    await page.$eval('textarea', el => el.value = '');
    await page.type('textarea', '   ');
    const submitBtnDisabled = await page.$eval('button[type="submit"]', el => el.disabled);
    recordTest('Empty prompt submission disabled', submitBtnDisabled);

    // 3. Test Exact Test Prompt:
    const exactPrompt = "I have 90 minutes free this evening. I don't want to spend money and I want something relaxing.";
    await page.$eval('textarea', el => el.value = '');
    await page.type('textarea', exactPrompt);

    const submitBtn = await page.$('button[type="submit"]');
    await submitBtn.click();
    console.log('Submitted test prompt, waiting for plan generation...');

    // Wait for Plan View to appear
    await page.waitForSelector('h1', { timeout: 8000 });
    await sleep(600); // UI transition

    const planHeader = await page.$eval('h1', el => el.innerText).catch(() => '');
    recordTest('Plan generated with title', planHeader.length > 5, `Plan Title: "${planHeader}"`);

    // Verify 90 minutes duration badge
    const badgeText = await page.$$eval('span', spans => spans.map(s => s.innerText).join(' '));
    recordTest('Plan respects 90 min duration', badgeText.includes('90 min total'), 'Found "90 min total"');
    recordTest('Plan respects zero-cost (free)', badgeText.toLowerCase().includes('no cost') || badgeText.toLowerCase().includes('free'), 'Verified zero cost');

    // Check milestones
    const milestoneElements = await page.$$('div.space-y-3 > div');
    recordTest('Schedule has milestones', milestoneElements.length >= 4, `Count: ${milestoneElements.length}`);

    // Check milestone duration sum
    const milestoneDurations = await page.$$eval('div.space-y-3 > div', items => {
      return items.map(item => {
        const text = item.innerText;
        const match = text.match(/(\d+)\s*min/);
        return match ? parseInt(match[1], 10) : 0;
      });
    });
    const totalMilestoneMinutes = milestoneDurations.reduce((a, b) => a + b, 0);
    recordTest('Milestone durations sum properly to ~90 mins', Math.abs(totalMilestoneMinutes - 90) <= 5, `Sum: ${totalMilestoneMinutes} min`);

    // Check Challenge Me section
    const challengeSection = await page.$eval('div.rounded-2xl.border-nature-200', el => el.innerText).catch(() => '');
    recordTest('Challenge Me sensory card present', challengeSection.includes('CHALLENGE ME') || challengeSection.includes('Challenge Me'));

    // Check Shuffle Challenge
    const challengeBefore = await page.$eval('div.rounded-2xl.border-nature-200 h3', el => el.innerText).catch(() => '');
    const shuffleBtn = await page.$('button[title="Shuffle challenge"]');
    if (shuffleBtn) {
      await shuffleBtn.click();
      await sleep(300);
      const challengeAfter = await page.$eval('div.rounded-2xl.border-nature-200 h3', el => el.innerText).catch(() => '');
      recordTest('Shuffle challenge clickable', true, `Before: "${challengeBefore}", After: "${challengeAfter}"`);
    } else {
      recordTest('Shuffle challenge button present', false);
    }

    // Check Preparation checklist
    const prepItems = await page.$$eval('ul.space-y-1\\.5 li', lis => lis.map(li => li.innerText));
    recordTest('Preparation tips present', prepItems.length >= 2, `Tips: ${prepItems.length}`);

    // Check Suitable Alternatives section
    const altSectionText = await page.$$eval('h3', headings => headings.map(h => h.innerText).join(' '));
    recordTest('Suitable Alternatives section present', altSectionText.toUpperCase().includes('SUITABLE ALTERNATIVES'));

    // Test 1-click alternative plan switch
    const initialTitle = await page.$eval('h1', el => el.innerText);
    const switched = await page.$$eval('button', btns => {
      const b = btns.find(btn => btn.innerText.trim() === 'Switch');
      if (b) { b.click(); return true; }
      return false;
    });
    if (switched) {
      await sleep(400);
      const switchedTitle = await page.$eval('h1', el => el.innerText);
      recordTest('1-click switch to alternative plan', switchedTitle !== initialTitle, `Switched to "${switchedTitle}"`);
    } else {
      recordTest('Alternative switch button found', false);
    }

    // ==========================================
    // Phase 2, Test C: Start Outside Time
    // ==========================================
    console.log('\n--- Test C: Start Outside Time ---');

    const startBtn = await page.$eval('button', () => {
      const btns = Array.from(document.querySelectorAll('button'));
      const found = btns.find(b => b.innerText.includes('Start Outside Time'));
      if (found) {
        found.click();
        return true;
      }
      return false;
    });
    recordTest('Clicked Start Outside Time', startBtn);
    await sleep(600);

    // Verify Screen Exit Mode
    const screenExitHeader = await page.$eval('div', el => document.body.innerText);
    recordTest('Transitions to Screen Exit Mode', screenExitHeader.includes('GO OUTSIDE MODE') || screenExitHeader.includes('Go Outside Mode'));

    const reminderText = await page.$eval('p.italic', el => el.innerText).catch(() => '');
    recordTest('"Put your phone away" reminder displayed', reminderText.includes('Put your phone away'));

    const timerDisplay = await page.$eval('div.font-mono.font-light', el => el.innerText).catch(() => '');
    recordTest('Timer countdown displayed', timerDisplay.includes(':'), `Timer: "${timerDisplay}"`);

    // Test Navigation: Next / Previous
    const nextBtn = await page.$eval('button', () => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(btn => btn.innerText.includes('Next'));
      if (b) { b.click(); return true; }
      return false;
    });
    await sleep(300);
    const phase2Text = await page.$eval('div.font-mono.tracking-widest', el => el.innerText).catch(() => '');
    recordTest('Next Phase navigation', phase2Text.toUpperCase().includes('PHASE 2'), `Phase: "${phase2Text}"`);

    const prevBtn = await page.$eval('button', () => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(btn => btn.innerText.includes('Previous'));
      if (b) { b.click(); return true; }
      return false;
    });
    await sleep(300);
    const phase1Text = await page.$eval('div.font-mono.tracking-widest', el => el.innerText).catch(() => '');
    recordTest('Previous Phase navigation', phase1Text.toUpperCase().includes('PHASE 1'), `Phase: "${phase1Text}"`);

    // Test Pause / Resume toggle
    const pauseClicked = await page.$$eval('button', btns => {
      const b = btns.find(btn => btn.innerText.includes('Pause'));
      if (b) { b.click(); return true; }
      return false;
    });
    await sleep(300);
    const pausedStatusText = await page.$eval('[data-testid="timer-status"]', el => el.innerText).catch(() => '');
    recordTest('Pause button toggles paused state', pausedStatusText.toUpperCase().includes('TIMER PAUSED'), `Status: "${pausedStatusText}"`);

    // Test Resume via Spacebar shortcut
    await page.keyboard.press('Space');
    await sleep(300);
    const resumedStatusText = await page.$eval('[data-testid="timer-status"]', el => el.innerText).catch(() => '');
    recordTest('Spacebar shortcut resumes countdown', resumedStatusText.toUpperCase().includes('REMAINING TIME'), `Status: "${resumedStatusText}"`);

    // ==========================================
    // Phase 2, Test D: Complete the Session
    // ==========================================
    console.log('\n--- Test D: Complete the Session ---');

    const finishBtn = await page.$eval('button', () => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(btn => btn.innerText.includes("I'm Back / Done Outside"));
      if (b) { b.click(); return true; }
      return false;
    });
    recordTest('Clicked "I\'m Back / Done Outside"', finishBtn);
    await sleep(600);

    // Verify Reflection Modal
    const welcomeBack = await page.$eval('h2', el => el.innerText).catch(() => '');
    recordTest('Welcome Back reflection modal appeared', welcomeBack.includes('Welcome back 🌿'), `Heading: "${welcomeBack}"`);

    // Select Mood "Better"
    const moodSelected = await page.$eval('button', () => {
      const btns = Array.from(document.querySelectorAll('button'));
      const betterBtn = btns.find(b => b.innerText.includes('Better'));
      if (betterBtn) { betterBtn.click(); return true; }
      return false;
    });
    recordTest('Selected mood: 😊 Better', moodSelected);

    // Type reflection note
    const reflectionTextarea = await page.$('div.fixed textarea');
    if (reflectionTextarea) {
      await reflectionTextarea.type('Felt completely decompressed. The autumn trees were beautiful.');
    }
    recordTest('Entered reflection note', !!reflectionTextarea);

    // Save to log
    const saveLogBtn = await page.$eval('button', () => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(btn => btn.innerText.includes('Save to Log'));
      if (b) { b.click(); return true; }
      return false;
    });
    recordTest('Clicked Save to Log', saveLogBtn);
    await sleep(600);

    // Check we returned to input screen
    const returnedToInput = await page.$('textarea');
    recordTest('Returned to main screen after saving', !!returnedToInput);

    // ==========================================
    // Phase 2, Test E: Persistence & History
    // ==========================================
    console.log('\n--- Test E: Persistence & History ---');

    // Open History view
    const historyBtn = await page.$('button[title="Outdoor History & Stats"]');
    if (historyBtn) {
      await historyBtn.click();
      await sleep(400);
    }
    const historyModal = await page.$eval('h2', el => el.innerText).catch(() => '');
    recordTest('Outside Log modal opened', historyModal.includes('Outside Log'), `Heading: "${historyModal}"`);

    // Verify stats
    const statsText = await page.$$eval('div.grid-cols-3 > div', els => els.map(e => e.innerText.replace(/\n/g, ' ')));
    console.log('Log stats:', statsText);
    const hasOutings = statsText.some(t => t.includes('1 Outings') || t.includes('1 OUTINGS'));
    recordTest('Stats count 1 outing correctly', hasOutings, `Stats: ${statsText.join(' | ')}`);

    // Verify session content in list
    const logEntries = await page.$$eval('div.p-4.rounded-xl', els => els.map(e => e.innerText));
    recordTest('Session entry recorded in list', logEntries.length >= 1, `Found ${logEntries.length} entries`);
    const entryHasReflection = logEntries.some(e => e.includes('autumn trees') || e.includes('decompressed'));
    recordTest('Reflection note saved in entry', entryHasReflection);

    // Test REFRESH PERSISTENCE
    console.log('Testing page reload persistence...');
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(500);

    // Re-open history after reload
    const historyBtnAfter = await page.$('button[title="Outdoor History & Stats"]');
    if (historyBtnAfter) {
      await historyBtnAfter.click();
      await sleep(400);
    }
    const logEntriesAfterReload = await page.$$eval('div.p-4.rounded-xl', els => els.map(e => e.innerText));
    recordTest('History persists across page reload', logEntriesAfterReload.length >= 1, `Count after reload: ${logEntriesAfterReload.length}`);

    // Close history
    const closeBtn = await page.$('button[aria-label="Close history log"]');
    if (closeBtn) {
      await closeBtn.click();
      await sleep(300);
    }

    // ==========================================
    // Theme Toggle & AI Settings Modal
    // ==========================================
    console.log('\n--- Additional Feature Verifications ---');

    // Test Theme toggle
    const themeBtn = await page.$('button[aria-label="Toggle theme"]');
    if (themeBtn) {
      const initialIsDark = await page.$eval('html', el => el.classList.contains('dark'));
      await themeBtn.click();
      await sleep(200);
      const after1IsDark = await page.$eval('html', el => el.classList.contains('dark'));
      recordTest('Theme toggle flips theme mode', after1IsDark !== initialIsDark, `From ${initialIsDark ? 'dark' : 'light'} to ${after1IsDark ? 'dark' : 'light'}`);

      await themeBtn.click();
      await sleep(200);
      const after2IsDark = await page.$eval('html', el => el.classList.contains('dark'));
      recordTest('Theme toggle restores previous theme', after2IsDark === initialIsDark, `Restored to ${after2IsDark ? 'dark' : 'light'}`);
    }

    // Test AI Settings modal
    const aiSettingsBtn = await page.$('button[title="Configure AI Provider & Engine"]');
    if (aiSettingsBtn) {
      await aiSettingsBtn.click();
      await sleep(300);
      const aiModalTitle = await page.$eval('h2', el => el.innerText).catch(() => '');
      recordTest('AI Settings Modal opens', aiModalTitle.includes('AI Engine & Privacy'));

      // Test connection button
      const testConnBtn = await page.$eval('button', () => {
        const btns = Array.from(document.querySelectorAll('button'));
        const b = btns.find(btn => btn.innerText.includes('Test Connection'));
        if (b) { b.click(); return true; }
        return false;
      });
      recordTest('Test Connection button clicked', testConnBtn);
      await sleep(1500);

      // Verify connection feedback is rendered (offline fallback or connected)
      const healthStatus = await page.$eval('[data-testid="connection-status"]', el => el.innerText).catch(() => '');
      recordTest('Connection test reports status without crash', healthStatus.includes('Offline') || healthStatus.includes('Connected'), `Status: "${healthStatus}"`);

      // Close modal
      const closeSettingsBtn = await page.$('button[aria-label="Close AI settings"]');
      if (closeSettingsBtn) {
        await closeSettingsBtn.click();
        await sleep(300);
      }
    }

    // Mobile Viewport test
    console.log('\n--- Mobile Viewport Test (375x812) ---');
    await page.setViewport({ width: 375, height: 812 });
    await sleep(300);

    const mobileInput = await page.$('textarea');
    recordTest('Mobile layout renders input cleanly', !!mobileInput);

    const mobileSubmitBtn = await page.$('button[type="submit"]');
    recordTest('Mobile submit button visible', !!mobileSubmitBtn);

  } catch (err) {
    console.error('Test execution error:', err);
    recordTest('Test suite runtime', false, err.message);
  } finally {
    await browser.close();
  }

  console.log('\n==========================================');
  console.log('BROWSER TEST SUMMARY:');
  const passedCount = testResults.filter(t => t.passed).length;
  const failedCount = testResults.filter(t => !t.passed).length;
  console.log(`TOTAL: ${testResults.length} | PASSED: ${passedCount} | FAILED: ${failedCount}`);

  if (errors.length > 0) {
    console.log('\nCaptured Page Errors:');
    errors.forEach(e => console.log(' - ' + e));
  } else {
    console.log('\nZero uncaught JavaScript errors or console errors!');
  }
  console.log('==========================================\n');

  return { passedCount, failedCount, errors, testResults };
}

runE2ETests().then(res => {
  if (res.failedCount > 0 || res.errors.length > 0) {
    process.exit(1);
  }
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
