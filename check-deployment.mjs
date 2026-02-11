import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

console.log('=== Checking https://www.level8.bg/blog (after deployment) ===');
const blogResp = await page.goto('https://www.level8.bg/blog', { waitUntil: 'networkidle', timeout: 30000 });
console.log('Status:', blogResp.status());
console.log('Header x-nextjs-prerender:', blogResp.headers()['x-nextjs-prerender'] || 'NOT PRESENT (dynamic!)');
await page.waitForTimeout(2000);
await page.screenshot({ path: 'blog-after-deploy.png', fullPage: false });

const blogText = await page.textContent('body');
console.log('Contains empty message:', blogText.includes('Скоро тук ще се появят'));
console.log('Page title:', await page.title());

// Count article cards
const articleCards = await page.locator('article, [class*="article"], [class*="post"]').count();
console.log('Article elements found:', articleCards);

// Try first article if exists
const firstArticleLink = await page.locator('a[href^="/blog/"]').first();
const firstArticleExists = await firstArticleLink.count() > 0;

if (firstArticleExists) {
  const href = await firstArticleLink.getAttribute('href');
  console.log('\n=== Found article link:', href, '===');

  const articleResp = await page.goto(`https://www.level8.bg${href}`, { waitUntil: 'networkidle', timeout: 30000 });
  console.log('Article status:', articleResp.status());
  console.log('Article header x-nextjs-prerender:', articleResp.headers()['x-nextjs-prerender'] || 'NOT PRESENT (dynamic!)');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'article-after-deploy.png', fullPage: false });

  const articleTitle = await page.title();
  console.log('Article title:', articleTitle);
  console.log('Article contains 404:', (await page.textContent('body')).includes('404') || (await page.textContent('body')).includes('Not Found'));
} else {
  console.log('\n❌ No article links found on /blog page');
}

await browser.close();
console.log('\n✓ Check complete. Screenshots saved.');
