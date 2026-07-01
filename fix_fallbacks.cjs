const fs = require('fs');

function fixFallbacks(filePath) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');
  const original = code;

  // Replace any remaining ui-avatars.com references
  code = code.replace(
    /`https:\/\/ui-avatars\.com\/api\/\?name=([^&`]+)[^`]*`/g, 
    (match, name) => {
      return '`https://api.dicebear.com/10.x/identicon/svg?seed=' + name + '`';
    }
  );

  if (code !== original) {
    fs.writeFileSync(filePath, code);
    console.log('FIXED FALLBACK: ' + filePath);
  }
}

fixFallbacks('src/components/publish/PublishLayout.tsx');
fixFallbacks('src/routes/ProfilePage.tsx');
fixFallbacks('src/templates/template1/Template1Page.tsx');
fixFallbacks('src/components/home/HomeHeader.tsx');

console.log('Done!');
