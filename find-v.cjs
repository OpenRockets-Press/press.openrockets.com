const fs = require('fs');
const sourceMap = require('source-map');
(async () => {
  const mapData = fs.readFileSync('dist/assets/Template1Page-BUNi7EZW.js.map', 'utf8');
  const code = fs.readFileSync('dist/assets/Template1Page-BUNi7EZW.js', 'utf8');
  const lines = code.split('\n');
  
  const consumer = await new sourceMap.SourceMapConsumer(mapData);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Find where V is declared
    const regex = /(?:const|let|var|function|class)\s+(?:[a-zA-Z0-9_]+,)*?V\b/g;
    let m;
    while ((m = regex.exec(line)) !== null) {
      const col = m.index + m[0].indexOf('V');
      const pos = consumer.originalPositionFor({ line: i + 1, column: col });
      if (pos.source) {
        console.log(`Found 'V' at ${i + 1}:${col} maps to ->`, pos);
      }
    }
  }
})();
