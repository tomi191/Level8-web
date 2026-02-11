import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

console.log('Opening https://www.level8.bg/blog...');
const resp = await page.goto('https://www.level8.bg/blog', { waitUntil: 'networkidle', timeout: 30000 });
console.log('Status:', resp.status());

await page.waitForTimeout(3000);

const text = await page.textContent('body');
console.log('Contains empty message:', text.includes('Скоро тук ще се появят'));
console.log('Contains article:', text.includes('AI тренд') || text.includes('Claude'));

await browser.close();
console.log('✓ Done. Now check Vercel runtime logs for [Blog Page] messages.');
