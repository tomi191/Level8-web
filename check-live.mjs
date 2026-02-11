import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// 1. Check /blog
console.log('=== Checking https://www.level8.bg/blog ===');
const blogResp = await page.goto('https://www.level8.bg/blog', { waitUntil: 'networkidle', timeout: 30000 });
console.log('Status:', blogResp.status());
console.log('Headers x-nextjs-prerender:', blogResp.headers()['x-nextjs-prerender'] || 'NOT PRESENT');
await page.waitForTimeout(2000);
await page.screenshot({ path: 'live-blog.png', fullPage: false });

const blogText = await page.textContent('body');
console.log('Contains empty message:', blogText.includes('Скоро тук ще се появят'));
console.log('Page title:', await page.title());

// Check nav/menu on blog page
const blogNavLinks = await page.locator('nav a, header a').all();
const blogNavData = [];
for (const el of blogNavLinks) {
  const text = (await el.textContent()).trim();
  const href = await el.getAttribute('href');
  if (text) blogNavData.push({ text, href });
}
console.log('Blog page nav links:', JSON.stringify(blogNavData.slice(0, 15), null, 2));

// 2. Check /admin
console.log('\n=== Checking https://www.level8.bg/admin ===');
const adminResp = await page.goto('https://www.level8.bg/admin', { waitUntil: 'networkidle', timeout: 30000 });
console.log('Status:', adminResp.status());
console.log('Final URL:', page.url());
await page.waitForTimeout(2000);
await page.screenshot({ path: 'live-admin.png', fullPage: false });

const adminText = await page.textContent('body');
console.log('Page contains login-related text:', adminText.includes('Вход') || adminText.includes('Login') || adminText.includes('Парола') || adminText.includes('password'));

// Check admin nav
const adminNavLinks = await page.locator('nav a, header a').all();
const adminNavData = [];
for (const el of adminNavLinks) {
  const text = (await el.textContent()).trim();
  const href = await el.getAttribute('href');
  if (text) adminNavData.push({ text, href });
}
console.log('Admin page nav/links:', JSON.stringify(adminNavData.slice(0, 15), null, 2));

// 3. Check homepage
console.log('\n=== Checking https://www.level8.bg/ (homepage) ===');
await page.goto('https://www.level8.bg/', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);
await page.screenshot({ path: 'live-home.png', fullPage: false });

const homeNavLinks = await page.locator('nav a, header a').all();
const homeNavData = [];
for (const el of homeNavLinks) {
  const text = (await el.textContent()).trim();
  const href = await el.getAttribute('href');
  if (text) homeNavData.push({ text, href });
}
console.log('Home page nav links:', JSON.stringify(homeNavData.slice(0, 15), null, 2));

// 4. Try a specific blog article
console.log('\n=== Checking a blog article ===');
const articleResp = await page.goto('https://www.level8.bg/blog/ai-trend-2026-how-artificial-intelligence-is-reshaping-digital-marketing', { waitUntil: 'networkidle', timeout: 30000 });
console.log('Article status:', articleResp.status());
await page.waitForTimeout(2000);
await page.screenshot({ path: 'live-blog-article.png', fullPage: false });
const articleTitle = await page.title();
console.log('Article title:', articleTitle);

await browser.close();
console.log('\nDone. Screenshots saved.');
