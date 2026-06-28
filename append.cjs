const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'index.css');

let css = fs.readFileSync(file, 'utf-8');

const fontImport = '@import url("https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600&display=swap");\n';
if (!css.includes('family=Noto+Sans')) {
  css = fontImport + css;
}

const printRule = `
@media print {
  .no-print {
    display: none !important;
  }
}
`;
if (!css.includes('.no-print')) {
  css = css + printRule;
}

fs.writeFileSync(file, css, 'utf-8');
console.log('Appended Noto Sans and .no-print');
