import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imgDir = path.resolve(__dirname, '../static/img/docs');
const BASE = 'http://localhost:3000';

function makeFakeJwt(overrides = {}) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = { id: 1, iat: Math.floor(Date.now() / 1000) - 60, exp: Math.floor(Date.now() / 1000) + 86400, ...overrides };
  const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  return b64(header) + '.' + b64(payload) + '.fakesig';
}

const MOCK_MYSPACE = {
  favoriteId: 1,
  items: [
    { id: 101, type: 'favorite', source: 'userprompt', updatedAt: '2025-01-01T00:00:00.000Z', share: true, tags: ['work'] },
    { id: 102, type: 'favorite', source: 'community', updatedAt: '2025-01-15T00:00:00.000Z', share: false, tags: ['study'] },
  ],
  customTags: [
    { id: 'tag1', name: 'Work', color: 'blue', order: 0 },
    { id: 'tag2', name: 'Study', color: 'green', order: 1 },
  ],
  favorites: { commLoves: [1, 3, 5], prompts: [], promptOrder: [] },
};

const MOCK_USER = { id: 1, username: 'TestUser', email: 'test@onebiu.com', provider: 'local' };

async function goTo(page, path, wait = 3000) {
  await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(wait);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // ============================================================
  // PHASE 1: Unauthenticated screenshots
  // ============================================================

  // 1. interface-home.png
  console.log('1. interface-home');
  await goTo(page, '/?view=explore');
  await page.screenshot({ path: path.join(imgDir, 'interface-home.png'), fullPage: false });

  // 2. interface-filter.png — click first tag to activate filter
  console.log('2. interface-filter');
  const tagEl = page.locator('.ant-tag-checkable').first();
  if (await tagEl.isVisible({ timeout: 3000 }).catch(() => false)) {
    await tagEl.click();
    await page.waitForTimeout(1500);
  }
  await page.screenshot({ path: path.join(imgDir, 'interface-filter.png'), fullPage: false });

  // 3. interface-search.png — search for "翻译"
  console.log('3. interface-search');
  await goTo(page, '/?view=explore&name=%E7%BF%BB%E8%AF%91');
  await page.screenshot({ path: path.join(imgDir, 'interface-search.png'), fullPage: false });

  // 4. prompt-card.png — click card for detail modal
  console.log('4. prompt-card');
  await goTo(page, '/?view=explore');
  try {
    await page.locator('.ant-card').first().click({ timeout: 5000 });
    await page.waitForTimeout(2000);
  } catch {}
  await page.screenshot({ path: path.join(imgDir, 'prompt-card.png'), fullPage: false });

  // 11. how-to-use-aione.png — hover card to reveal copy action
  console.log('11. how-to-use-aione');
  await goTo(page, '/?view=explore');
  try {
    await page.locator('.ant-card').first().hover({ timeout: 3000 });
    await page.waitForTimeout(800);
  } catch {}
  await page.screenshot({ path: path.join(imgDir, 'how-to-use-aione.png'), fullPage: false });

  // 8. account-login.png — click "免费登录" to open login modal
  console.log('8. account-login');
  await goTo(page, '/');
  try {
    await page.waitForSelector('button:has-text("免费登录")', { timeout: 5000 });
    await page.locator('button:has-text("免费登录")').first().click({ timeout: 5000 });
    await page.waitForTimeout(2000);
    console.log('  Login modal opened');
  } catch (e) {
    console.log('  Login error:', e.message.substring(0, 80));
  }
  await page.screenshot({ path: path.join(imgDir, 'account-login.png'), fullPage: false });

  // 9. account-register.png — login modal → register tab
  console.log('9. account-register');
  await goTo(page, '/');
  try {
    await page.waitForSelector('button:has-text("免费登录")', { timeout: 5000 });
    await page.locator('button:has-text("免费登录")').first().click({ timeout: 5000 });
    await page.waitForTimeout(1500);
    await page.waitForSelector('.ant-modal button:has-text("立即注册")', { timeout: 3000 });
    await page.locator('.ant-modal button:has-text("立即注册")').click();
    await page.waitForTimeout(1500);
    console.log('  Register form shown');
  } catch (e) {
    console.log('  Register error:', e.message.substring(0, 80));
  }
  await page.screenshot({ path: path.join(imgDir, 'account-register.png'), fullPage: false });

  // 12. community-page.png
  console.log('12. community-page');
  await goTo(page, '/community-prompts', 4000);
  await page.screenshot({ path: path.join(imgDir, 'community-page.png'), fullPage: false });

  // 13. community-vote.png — scroll to show vote buttons on cards
  console.log('13. community-vote');
  await page.evaluate(() => window.scrollBy(0, 450));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(imgDir, 'community-vote.png'), fullPage: false });

  // ============================================================
  // PHASE 2: Authenticated screenshots (single continuous session)
  // ============================================================

  // Set up API mocks (set once, persist across navigation)
  await page.route('**/api/myspace**', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_MYSPACE) });
  });
  await page.route('**/api/users/me**', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_USER) });
  });

  // Inject auth token and lscache
  const jwt = makeFakeJwt();
  const lscacheUserAuth = JSON.stringify({
    data: { favorites: { commLoves: [1, 3, 5], prompts: [], promptOrder: [] }, customTags: [] }
  });

  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(1000);
  await page.evaluate(({ token, cache }) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('lscache-user_auth', cache);
  }, { token: jwt, cache: lscacheUserAuth });
  await page.reload({ waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(5000);

  // 5. my-collection-view.png — collection overview
  console.log('5. my-collection-view');
  await page.screenshot({ path: path.join(imgDir, 'my-collection-view.png'), fullPage: false });

  // 6. my-collection-tag.png — open tag management modal
  console.log('6. my-collection-tag');
  try {
    await page.waitForSelector('button:has-text("管理标签")', { timeout: 5000 });
    await page.locator('button:has-text("管理标签")').first().click({ timeout: 5000 });
    await page.waitForTimeout(2000);
    console.log('  Tag management opened');
  } catch (e) {
    console.log('  Tag error:', e.message.substring(0, 80));
  }
  await page.screenshot({ path: path.join(imgDir, 'my-collection-tag.png'), fullPage: false });

  // 7. my-collection-drag.png — close modal, show collection with drag handles
  console.log('7. my-collection-drag');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(imgDir, 'my-collection-drag.png'), fullPage: false });

  // 14. user-prompts-create.png — click "创建提示词" to open create modal
  console.log('14. user-prompts-create');
  try {
    await page.waitForSelector('button:has-text("创建提示词")', { timeout: 5000 });
    await page.locator('button:has-text("创建提示词")').first().click({ timeout: 5000 });
    await page.waitForTimeout(2500);
    console.log('  Create prompt opened');
  } catch (e) {
    console.log('  Create error:', e.message.substring(0, 80));
  }
  await page.screenshot({ path: path.join(imgDir, 'user-prompts-create.png'), fullPage: false });

  // 15. user-prompts-edit.png — close create modal, click card edit icon to open edit form
  console.log('15. user-prompts-edit');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1500);
  try {
    // Hover first card to reveal the edit icon, then click it
    const colCard = page.locator('.ant-card').first();
    if (await colCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await colCard.hover({ timeout: 3000 });
      await page.waitForTimeout(500);
      const editIcon = page.locator('[aria-label="edit"]').first();
      if (await editIcon.isVisible({ timeout: 2000 }).catch(() => false)) {
        await editIcon.click({ timeout: 5000 });
        await page.waitForTimeout(2000);
        console.log('  Edit modal opened');
      }
    }
  } catch (e) {
    console.log('  Edit error:', e.message.substring(0, 80));
  }
  await page.screenshot({ path: path.join(imgDir, 'user-prompts-edit.png'), fullPage: false });

  // 10. account-profile.png — close any modal, click Settings gear icon
  console.log('10. account-profile');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
  try {
    await page.waitForSelector('[aria-label="Settings"]', { timeout: 5000 });
    await page.locator('[aria-label="Settings"]').first().click({ timeout: 5000 });
    await page.waitForTimeout(2000);
    console.log('  Settings opened');
  } catch (e) {
    console.log('  Settings error:', e.message.substring(0, 80));
  }
  await page.screenshot({ path: path.join(imgDir, 'account-profile.png'), fullPage: false });

  await browser.close();
  console.log('\nAll 15 screenshots saved to static/img/docs/');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
