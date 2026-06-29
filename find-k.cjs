const fs = require('fs');
const sourceMap = require('source-map');
(async () => {
  const mapData = fs.readFileSync('dist/assets/Template1Page-tWf-61mh.js.map', 'utf8');
  const code = fs.readFileSync('dist/assets/Template1Page-tWf-61mh.js', 'utf8');
  const lines = code.split('\n');
  
  const consumer = await new sourceMap.SourceMapConsumer(mapData);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match = /(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=/.exec(line);
    
    // In minified code, multiple variables can be declared. Let's just find ANY reference to "k"
    // But since "k" is used everywhere, it's hard. 
    // Instead, let's look for "Cannot access 'k' before initialization".
    // This implies 'k' is a block-scoped variable (let/const/class).
    
    // Let's print out what maps to `k` when `k` is declared.
    const regex = /(?:const|let|var)\s+(?:[a-zA-Z0-9_]+,)*?k\s*(?:=|,|;)/g;
    let m;
    while ((m = regex.exec(line)) !== null) {
      const pos = consumer.originalPositionFor({ line: i + 1, column: m.index + m[0].indexOf('k') });
      if (pos.source) {
        console.log(`Found 'k' at ${i + 1}:${m.index} maps to ->`, pos);
      }
    }
    
    // Also classes
    const regexClass = /class\s+k\b/g;
    while ((m = regexClass.exec(line)) !== null) {
      const pos = consumer.originalPositionFor({ line: i + 1, column: m.index + m[0].indexOf('k') });
      if (pos.source) {
        console.log(`Found class 'k' at ${i + 1}:${m.index} maps to ->`, pos);
      }
    }
  }
})();
