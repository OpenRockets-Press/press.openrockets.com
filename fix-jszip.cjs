const fs = require('fs');
let code = fs.readFileSync('src/templates/template1/Template1Page.tsx', 'utf8');
code = code.replace('import JSZip from "jszip";\n', '');
code = code.replace('const mainZip = new JSZip();\n      const filesZip = new JSZip();', 'const JSZipModule = await import("jszip");\n      const JSZip = JSZipModule.default || JSZipModule;\n      const mainZip = new JSZip();\n      const filesZip = new JSZip();');
fs.writeFileSync('src/templates/template1/Template1Page.tsx', code);
console.log('done');
