import puppeteer from 'puppeteer-core';

async function run() {
  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  console.log('Navigating to https://web.whatsapp.com/catalog/923442892441 ...');
  await page.goto('https://web.whatsapp.com/catalog/923442892441', { waitUntil: 'networkidle2', timeout: 40000 });

  await new Promise(r => setTimeout(r, 10000));

  const screenshotPath = 'wa_web_catalog_screenshot.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('Screenshot saved to', screenshotPath);

  const text = await page.evaluate(() => document.body.innerText);
  console.log('WhatsApp Web Page Text:\n', text.slice(0, 1500));

  await browser.close();
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
