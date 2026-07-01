const fs = require('fs');

function fixPreloads(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  code = code.split('<Link to="/login"').join('<Link preload={false} to="/login"');
  code = code.split('<Link to="/publish"').join('<Link preload={false} to="/publish"');
  code = code.split('<Link to="/register"').join('<Link preload={false} to="/register"');
  fs.writeFileSync(filePath, code);
}

fixPreloads('src/components/home/HomeHeader.tsx');
fixPreloads('src/components/AppShell.tsx');
fixPreloads('src/routes/HomePage.tsx');

console.log('Fixed preloads successfully.');
