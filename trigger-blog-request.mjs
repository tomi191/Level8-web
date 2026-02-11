// Trigger a /blog request to generate new logs
const resp = await fetch('https://www.level8.bg/blog', {
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  }
});

console.log('Status:', resp.status);
console.log('Triggered blog request. Check Vercel logs now.');
