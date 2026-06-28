const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'public', 'stylesofshitheader.txt');
const outputFile = path.join(__dirname, 'src', 'index.css');

try {
  const content = fs.readFileSync(inputFile, 'utf-8');
  
  // Find the exact <style> tag for index.css
  const startMarker = '<style type="text/css" data-vite-dev-id="C:/Users/HP/Documents/trash/press.openrockets.com/src/index.css">';
  const startIndex = content.indexOf(startMarker);
  
  if (startIndex === -1) {
    console.error('Could not find the start marker!');
    process.exit(1);
  }
  
  const actualStart = startIndex + startMarker.length;
  const endIndex = content.indexOf('</style>', actualStart);
  
  if (endIndex === -1) {
    console.error('Could not find the end marker!');
    process.exit(1);
  }
  
  const extractedCss = content.substring(actualStart, endIndex);
  
  fs.writeFileSync(outputFile, extractedCss, 'utf-8');
  console.log('Successfully recovered ' + extractedCss.split('\\n').length + ' lines of CSS!');
} catch (e) {
  console.error('Error:', e);
}
