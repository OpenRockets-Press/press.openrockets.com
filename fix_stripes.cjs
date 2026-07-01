const fs = require('fs');
const files = [
  'src/components/home/HomeHeader.tsx',
  'src/components/home/RichArticleCard.tsx',
  'src/components/publish/PublishLayout.tsx',
  'src/routes/ProfilePage.tsx',
  'src/templates/template1/Template1Page.tsx',
];
for (const f of files) {
  let code = fs.readFileSync(f, 'utf8');
  code = code.split('10.x/identicon/svg').join('10.x/stripes/svg');
  fs.writeFileSync(f, code);
}
console.log('Done – all profile images switched to stripes.');
