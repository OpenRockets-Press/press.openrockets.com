const fs = require('fs');
let code = fs.readFileSync('src/routes/SubmissionsPage.tsx', 'utf8');

const extraFields = `
              previewStorageKey: p.previewStorageKey,
              coverStorageKey: p.coverStorageKey,
              fileStorageKey: p.fileStorageKey,
              extraFiles: p.extraFiles,
              threejsModelKey: p.threejsModelKey,
              license: p.license,
              codeSnippet: p.codeSnippet || (p.metadata ? p.metadata.codeSnippet : undefined),`;

code = code.split('fileCount,').join('fileCount,' + extraFields);
fs.writeFileSync('src/routes/SubmissionsPage.tsx', code);
console.log('Fixed SubmissionsPage mapping');
