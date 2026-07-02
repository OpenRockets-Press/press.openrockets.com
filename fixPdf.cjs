const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/templates/template1/Template1Page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /html2canvas:\s*\{\s*scale:\s*2,\s*useCORS:\s*true,\s*scrollY:\s*0\s*\}/;

const replacementContent = `html2canvas:  { 
            scale: 2, 
            useCORS: true, 
            scrollY: 0,
            onclone: (clonedDoc) => {
              const imgs = clonedDoc.querySelectorAll('img');
              for (let i = 0; i < imgs.length; i++) {
                const img = imgs[i];
                if (img.src && img.src.startsWith('http') && !img.src.includes(window.location.host)) {
                  img.crossOrigin = "anonymous";
                  img.src = 'https://corsproxy.io/?' + encodeURIComponent(img.src);
                }
              }
            }
          }`;

if (regex.test(content)) {
    content = content.replace(regex, replacementContent);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Successfully updated Template1Page.tsx!");
} else {
    console.log("Target regex not found.");
}
