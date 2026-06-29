const fs = require('fs');
const path = require('path');
const sourceMap = require('source-map');

(async () => {
  const dir = 'dist/assets';
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
  
  for (const file of files) {
    const mapFile = file + '.map';
    if (!fs.existsSync(path.join(dir, mapFile))) continue;
    
    const mapData = fs.readFileSync(path.join(dir, mapFile), 'utf8');
    const code = fs.readFileSync(path.join(dir, file), 'utf8');
    const lines = code.split('\n');
    
    const consumer = await new sourceMap.SourceMapConsumer(mapData);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const regex = /(?:const|let|var|function|class)\s+(?:[a-zA-Z0-9_]+,)*?V\b/g;
      let m;
      while ((m = regex.exec(line)) !== null) {
        const col = m.index + m[0].indexOf('V');
        const pos = consumer.originalPositionFor({ line: i + 1, column: col });
        if (pos.source && pos.source.includes('three')) {
          console.log(`[${file}] Found 'V' at ${i + 1}:${col} maps to ->`, pos);
        }
        if (pos.source && pos.source.includes('react-three')) {
          console.log(`[${file}] Found 'V' at ${i + 1}:${col} maps to ->`, pos);
        }
      }
    }
  }
})();
