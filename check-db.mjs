const url = 'https://jtgdyhbprndexgnfaqwj.supabase.co/rest/v1/blog_posts';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Z2R5aGJwcm5kZXhnbmZhcXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MzA2NTIsImV4cCI6MjA4NjEwNjY1Mn0.BJSqOb6nkHUks_8DAS0R73x3e0LGxZHBnTLDVD0d2Eg';

const res = await fetch(url + '?select=id,title,slug,status&order=published_at.desc', {
  headers: {
    'apikey': anonKey,
    'Authorization': 'Bearer ' + anonKey
  }
});

const data = await res.json();
console.log('HTTP Status:', res.status);
console.log('Total blog posts:', data.length || 0);
if (data.length > 0) {
  console.log('\nPosts:');
  data.forEach(p => console.log(`  - [${p.status}] ${p.title} (${p.slug})`));
} else {
  console.log('\n❌ No blog posts found in database!');
  console.log('Response:', JSON.stringify(data, null, 2));
}
