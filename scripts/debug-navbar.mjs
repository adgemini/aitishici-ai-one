import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

// Test multiple en routes with correct Docusaurus paths
const routes = [
  '/',
  '/en/',
  '/en/docs/',
  '/en/docs/deploy',
  '/en/docs/guides/interface',
  '/en/community-prompts',
  '/en/feedback',
  '/ja/',
  '/fr/',
  '/ar/',
  '/zh-Hant/',
  '/ru/',
];
for (const route of routes) {
  await page.goto('http://localhost:3000' + route, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2000);
  const h1 = await page.locator('h1').first().textContent().catch(() => 'none');
  const htmlLang = await page.locator('html').getAttribute('lang');
  const title = await page.title();
  const has404 = title.includes('找不到页面') || h1 === '找不到页面';
  console.log(`${has404 ? '✗' : '✓'} ${route} -> H1: "${h1}" | lang: ${htmlLang}`);
}

await browser.close();
