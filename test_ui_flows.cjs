const puppeteer = require('./frontend/node_modules/puppeteer-core');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function run() {
  console.log('Launching Edge browser at:', edgePath);
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const consoleErrors = [];
  const networkErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('response', res => {
    if (res.status() >= 400) {
      networkErrors.push({ url: res.url(), status: res.status() });
    }
  });

  const results = {};

  try {
    // =========================================================================
    // FLOW 1: History -> Screening -> Case -> Alert
    // (VG-2026-10480 -> CASE-2026-081 -> ALT-901)
    // =========================================================================
    console.log('\n======================================================');
    console.log('FLOW 1: History -> Screening -> Case -> Alert');
    console.log('Target Chain: VG-2026-10480 -> CASE-2026-081 -> ALT-901');
    console.log('======================================================');

    console.log('1.1 Navigating to http://localhost:5173/history...');
    await page.goto('http://localhost:5173/history', { waitUntil: 'networkidle0' });

    console.log('1.2 Clicking screening row VG-2026-10480...');
    await page.waitForSelector('table tbody tr');
    const clickedScreening = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      for (const row of rows) {
        if (row.textContent.includes('VG-2026-10480')) {
          const btn = row.querySelector('button') || row;
          btn.click();
          return true;
        }
      }
      return false;
    });
    if (!clickedScreening) throw new Error('Could not find row for VG-2026-10480 in History table');

    console.log('1.3 Waiting for Verification Dossier modal...');
    await page.waitForSelector('.modal-overlay .modal-content');
    const modalHeader = await page.$eval('.modal-header h2', el => el.textContent.trim());
    console.log('    Dossier Title:', modalHeader);
    if (!modalHeader.includes('VG-2026-10480')) {
      throw new Error(`Screening Dossier ID mismatch: expected VG-2026-10480, got "${modalHeader}"`);
    }

    console.log('1.4 Clicking associated Case (CASE-2026-081)...');
    const clickedCaseBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.modal-content button'));
      const btn = btns.find(b => b.textContent.includes('Open Case File'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    if (!clickedCaseBtn) throw new Error('Could not find "Open Case File" button in Verification Dossier');

    console.log('1.5 Waiting for navigation to /cases and Case Dossier modal...');
    await page.waitForFunction(() => window.location.pathname === '/cases');
    await page.waitForSelector('.modal-overlay .modal-content');
    const caseHeader = await page.$eval('.modal-header h2', el => el.textContent.trim());
    console.log('    Case Dossier Title:', caseHeader);
    if (!caseHeader.includes('CASE-2026-081')) {
      throw new Error(`Case Dossier ID mismatch: expected CASE-2026-081, got "${caseHeader}"`);
    }

    console.log('1.6 Clicking "View Verification" button in Case Dossier...');
    const clickedVerifBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.modal-content button'));
      const btn = btns.find(b => b.textContent.includes('View Verification'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    if (!clickedVerifBtn) throw new Error('Could not find "View Verification" button in Case Dossier');

    console.log('1.7 Waiting for navigation to /history and Verification Dossier modal...');
    await page.waitForFunction(() => window.location.pathname === '/history');
    await page.waitForSelector('.modal-overlay .modal-content');
    const returnedVerifHeader = await page.$eval('.modal-header h2', el => el.textContent.trim());
    console.log('    Returned Verification Dossier Title:', returnedVerifHeader);
    if (!returnedVerifHeader.includes('VG-2026-10480')) {
      throw new Error(`Returned Verification mismatch: expected VG-2026-10480, got "${returnedVerifHeader}"`);
    }

    console.log('1.8 Clicking associated Alert (ALT-901)...');
    const clickedAlertBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.modal-content button'));
      const btn = btns.find(b => b.textContent.includes('Open Alert'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    if (!clickedAlertBtn) throw new Error('Could not find "Open Alert" button in Verification Dossier');

    console.log('1.9 Waiting for navigation to /alerts and Alert Dossier modal...');
    await page.waitForFunction(() => window.location.pathname === '/alerts');
    await page.waitForSelector('.modal-overlay .modal-content');
    const alertHeader = await page.$eval('.modal-header h2', el => el.textContent.trim());
    console.log('    Alert Dossier Title:', alertHeader);
    if (!alertHeader.includes('ALT-901')) {
      throw new Error(`Alert Dossier mismatch: expected ALT-901, got "${alertHeader}"`);
    }

    results['Flow 1'] = 'PASS';
    console.log('>>> FLOW 1 RESULT: PASS\n');

    // =========================================================================
    // FLOW 2: Cases -> Screening -> Alert
    // (CASE-2026-080 -> VG-2026-10477 -> ALT-902)
    // =========================================================================
    console.log('======================================================');
    console.log('FLOW 2: Cases -> Screening -> Alert');
    console.log('Target Chain: CASE-2026-080 -> VG-2026-10477 -> ALT-902');
    console.log('======================================================');

    console.log('2.1 Navigating to http://localhost:5173/cases...');
    await page.goto('http://localhost:5173/cases', { waitUntil: 'networkidle0' });

    console.log('2.2 Clicking case row CASE-2026-080...');
    await page.waitForSelector('table tbody tr');
    const clickedC80 = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      for (const row of rows) {
        if (row.textContent.includes('CASE-2026-080')) {
          const btn = row.querySelector('button') || row;
          btn.click();
          return true;
        }
      }
      return false;
    });
    if (!clickedC80) throw new Error('Could not find row for CASE-2026-080');

    console.log('2.3 Waiting for Case Dossier modal...');
    await page.waitForSelector('.modal-overlay .modal-content');
    const c80Title = await page.$eval('.modal-header h2', el => el.textContent.trim());
    console.log('    Case Dossier Title:', c80Title);
    if (!c80Title.includes('CASE-2026-080')) {
      throw new Error(`Case ID mismatch: expected CASE-2026-080, got "${c80Title}"`);
    }

    console.log('2.4 Clicking "View Verification" button in Case Dossier...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.modal-content button'));
      const btn = btns.find(b => b.textContent.includes('View Verification'));
      if (btn) btn.click();
    });

    console.log('2.5 Waiting for navigation to /history and Verification Dossier...');
    await page.waitForFunction(() => window.location.pathname === '/history');
    await page.waitForSelector('.modal-overlay .modal-content');
    const v10477Title = await page.$eval('.modal-header h2', el => el.textContent.trim());
    console.log('    Verification Dossier Title:', v10477Title);
    if (!v10477Title.includes('VG-2026-10477')) {
      throw new Error(`Verification mismatch: expected VG-2026-10477, got "${v10477Title}"`);
    }

    console.log('2.6 Clicking linked alert (ALT-902)...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.modal-content button'));
      const btn = btns.find(b => b.textContent.includes('Open Alert'));
      if (btn) btn.click();
    });

    console.log('2.7 Waiting for navigation to /alerts and Alert Dossier...');
    await page.waitForFunction(() => window.location.pathname === '/alerts');
    await page.waitForSelector('.modal-overlay .modal-content');
    const a902Title = await page.$eval('.modal-header h2', el => el.textContent.trim());
    console.log('    Alert Dossier Title:', a902Title);
    if (!a902Title.includes('ALT-902')) {
      throw new Error(`Alert mismatch: expected ALT-902, got "${a902Title}"`);
    }

    results['Flow 2'] = 'PASS';
    console.log('>>> FLOW 2 RESULT: PASS\n');

    // =========================================================================
    // FLOW 3: Alerts -> Case -> Screening
    // (ALT-903 -> CASE-2026-079 -> VG-2026-10481)
    // =========================================================================
    console.log('======================================================');
    console.log('FLOW 3: Alerts -> Case -> Screening');
    console.log('Target Chain: ALT-903 -> CASE-2026-079 -> VG-2026-10481');
    console.log('======================================================');

    console.log('3.1 Navigating to http://localhost:5173/alerts...');
    await page.goto('http://localhost:5173/alerts', { waitUntil: 'networkidle0' });

    console.log('3.2 Clicking alert ALT-903 "View Details"...');
    await page.waitForSelector('.alert-card-item');
    const clickedA903 = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.alert-card-item'));
      for (const card of cards) {
        if (card.textContent.includes('ALT-903')) {
          const btns = Array.from(card.querySelectorAll('button'));
          const viewBtn = btns.find(b => b.textContent.includes('View Details')) || card;
          viewBtn.click();
          return true;
        }
      }
      return false;
    });
    if (!clickedA903) throw new Error('Could not find card for ALT-903');

    console.log('3.3 Waiting for Alert Dossier modal...');
    await page.waitForSelector('.modal-overlay .modal-content');
    const a903Title = await page.$eval('.modal-header h2', el => el.textContent.trim());
    console.log('    Alert Dossier Title:', a903Title);
    if (!a903Title.includes('ALT-903')) {
      throw new Error(`Alert mismatch: expected ALT-903, got "${a903Title}"`);
    }

    console.log('3.4 Clicking "Open Case" in Alert Dossier...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.modal-content button'));
      const btn = btns.find(b => b.textContent.includes('Open Case'));
      if (btn) btn.click();
    });

    console.log('3.5 Waiting for navigation to /cases and Case Dossier...');
    await page.waitForFunction(() => window.location.pathname === '/cases');
    await page.waitForSelector('.modal-overlay .modal-content');
    const c79Title = await page.$eval('.modal-header h2', el => el.textContent.trim());
    console.log('    Case Dossier Title:', c79Title);
    if (!c79Title.includes('CASE-2026-079')) {
      throw new Error(`Case mismatch: expected CASE-2026-079, got "${c79Title}"`);
    }

    console.log('3.6 Clicking "View Verification" in Case Dossier...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.modal-content button'));
      const btn = btns.find(b => b.textContent.includes('View Verification'));
      if (btn) btn.click();
    });

    console.log('3.7 Waiting for navigation to /history and Verification Dossier...');
    await page.waitForFunction(() => window.location.pathname === '/history');
    await page.waitForSelector('.modal-overlay .modal-content');
    const v10481Title = await page.$eval('.modal-header h2', el => el.textContent.trim());
    console.log('    Verification Dossier Title:', v10481Title);
    if (!v10481Title.includes('VG-2026-10481')) {
      throw new Error(`Verification mismatch: expected VG-2026-10481, got "${v10481Title}"`);
    }

    results['Flow 3'] = 'PASS';
    console.log('>>> FLOW 3 RESULT: PASS\n');

    // =========================================================================
    // FLOW 4: Dashboard
    // =========================================================================
    console.log('======================================================');
    console.log('FLOW 4: Dashboard (Recent Screening & Priority Alert)');
    console.log('======================================================');

    console.log('4.1 Navigating to http://localhost:5173/...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

    console.log('4.2 Clicking a Recent Screening row...');
    await page.waitForSelector('.recent-panel table tbody tr');
    const clickedRecent = await page.evaluate(() => {
      const row = document.querySelector('.recent-panel table tbody tr');
      if (row) {
        const idEl = row.querySelector('.screening-id');
        const id = idEl ? idEl.textContent.trim() : null;
        const btn = row.querySelector('button') || row;
        btn.click();
        return id;
      }
      return null;
    });
    console.log('    Clicked recent screening ID:', clickedRecent);

    console.log('4.3 Waiting for navigation to /history and Verification Dossier...');
    await page.waitForFunction(() => window.location.pathname === '/history');
    await page.waitForSelector('.modal-overlay .modal-content');
    const dashVerifHeader = await page.$eval('.modal-header h2', el => el.textContent.trim());
    console.log('    Opened Screening Dossier Title:', dashVerifHeader);
    if (!dashVerifHeader.includes(clickedRecent)) {
      throw new Error(`Dashboard screening mismatch: expected ${clickedRecent}, got "${dashVerifHeader}"`);
    }

    console.log('4.4 Returning to Dashboard (http://localhost:5173/)...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

    console.log('4.5 Clicking a Priority Alert "Inspect Dossier"...');
    await page.waitForSelector('.alerts-panel .alert-item');
    const clickedAlertInfo = await page.evaluate(() => {
      const item = document.querySelector('.alerts-panel .alert-item');
      if (item) {
        const titleEl = item.querySelector('.alert-title-row strong');
        const title = titleEl ? titleEl.textContent.trim() : 'Alert';
        const inspectBtn = Array.from(item.querySelectorAll('button')).find(b => b.textContent.includes('Inspect Dossier')) || item;
        inspectBtn.click();
        return title;
      }
      return null;
    });
    console.log('    Clicked alert item:', clickedAlertInfo);

    console.log('4.6 Waiting for navigation to /alerts and Alert Dossier...');
    await page.waitForFunction(() => window.location.pathname === '/alerts');
    await page.waitForSelector('.modal-overlay .modal-content');
    const dashAlertHeader = await page.$eval('.modal-header h2', el => el.textContent.trim());
    console.log('    Opened Alert Dossier Title:', dashAlertHeader);
    if (!dashAlertHeader.includes('ALT-')) {
      throw new Error(`Dashboard alert mismatch: expected ALT- prefix, got "${dashAlertHeader}"`);
    }

    results['Flow 4'] = 'PASS';
    console.log('>>> FLOW 4 RESULT: PASS\n');

  } finally {
    await browser.close();
  }

  console.log('======================================================');
  console.log('BROWSER CONSOLE & NETWORK AUDIT');
  console.log('======================================================');
  console.log('Console Errors (' + consoleErrors.length + '):', consoleErrors);
  console.log('Network Status >= 400 (' + networkErrors.length + '):', networkErrors);

  const allPassed =
    results['Flow 1'] === 'PASS' &&
    results['Flow 2'] === 'PASS' &&
    results['Flow 3'] === 'PASS' &&
    results['Flow 4'] === 'PASS' &&
    consoleErrors.length === 0 &&
    networkErrors.length === 0;

  console.log('\n======================================================');
  console.log('FINAL VERIFICATION RESULT');
  console.log('======================================================');
  if (allPassed) {
    console.log('FINAL UI FLOW VERIFICATION: PASS');
  } else {
    console.log('FINAL UI FLOW VERIFICATION: BLOCKED');
  }
}

run().catch(err => {
  console.error('\nEXECUTION FAILED:', err.message);
  console.log('\nFINAL UI FLOW VERIFICATION: BLOCKED');
  process.exit(1);
});
