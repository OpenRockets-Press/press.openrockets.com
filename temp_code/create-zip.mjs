import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const zip = new JSZip();

zip.file("index.js", "console.log('Hello World');\n\nfunction calculate(a, b) {\n  return a + b;\n}\n");
zip.file("style.css", "body {\n  margin: 0;\n  padding: 0;\n  background-color: #fff;\n}\n\nh1 {\n  color: #333;\n}\n");
zip.file("README.md", "# Sample Project\n\nThis is a sample project to demonstrate the CodeViewerBox.");

const content = await zip.generateAsync({type: "nodebuffer"});

const outPath = path.resolve(__dirname, "../public/brand/sample-code.zip");
fs.writeFileSync(outPath, content);

console.log("Mock zip created at: " + outPath);
