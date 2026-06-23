const fs = require('fs');
const lines = fs.readFileSync('C:\\Users\\HP\\.gemini\\antigravity\\brain\\3f31f796-b39d-4766-a39e-83d1bc2c23c5\\.system_generated\\logs\\transcript_full.jsonl', 'utf-8').trim().split('\n');
for (let i = lines.length - 1; i >= 0; i--) {
  if (!lines[i]) continue;
  try {
    const log = JSON.parse(lines[i]);
    if (log.type === 'USER_INPUT') {
      fs.writeFileSync('plan_dump.md', log.content);
      console.log('Dumped plan successfully');
      break;
    }
  } catch (e) {
    console.error(e);
  }
}
