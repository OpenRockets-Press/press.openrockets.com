import fs from 'fs/promises';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const labelsPath = path.join(__dirname, 'src/data/labels.json');
const outDir = path.join(__dirname, 'public/brand/communities');

async function downloadFile(urlStr, dest) {
  return new Promise((resolve, reject) => {
    const protocol = urlStr.startsWith('https') ? https : http;
    // Follow up to 3 redirects just in case
    const request = protocol.get(urlStr, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (response) => {
      if (response.statusCode === 200) {
        // Need traditional fs for createWriteStream
        const file = require('fs').createWriteStream(dest);
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307 || response.statusCode === 308) {
        if (response.headers.location) {
          downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        } else {
          reject(new Error(`Redirect without location: ${urlStr}`));
        }
      } else {
        reject(new Error(`Failed to download ${urlStr}: ${response.statusCode}`));
      }
    });
    
    request.on('error', (err) => {
      reject(err);
    });
  });
}

async function run() {
  const data = JSON.parse(await fs.readFile(labelsPath, 'utf8'));
  for (const label of data) {
    if (label.image.startsWith('http')) {
      const url = new URL(label.image);
      const ext = path.extname(url.pathname) || '.png'; // Fallback to png
      const filename = `${label.id}${ext}`;
      const dest = path.join(outDir, filename);
      console.log(`Downloading ${label.image} to ${dest}...`);
      
      try {
        await downloadFile(label.image, dest);
        label.image = `/brand/communities/${filename}`;
      } catch (err) {
        console.error(`Error downloading ${label.image}:`, err);
      }
    }
  }
  
  await fs.writeFile(labelsPath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Done.');
}

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

run();
