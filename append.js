const fs = require('fs');
const css = `
@keyframes slowRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.rich-article-card:hover .threed-icon-image {
  animation: slowRotate 15s linear infinite;
}
`;
fs.appendFileSync('src/index.css', css);
