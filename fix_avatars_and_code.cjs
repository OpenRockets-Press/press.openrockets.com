const fs = require('fs');

// =======================================================
// 1. Replace all ui-avatars.com with DiceBear Identicon
// =======================================================

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log('SKIP (not found): ' + filePath);
    return;
  }
  let code = fs.readFileSync(filePath, 'utf8');
  const original = code;

  // Pattern: https://ui-avatars.com/api/?name=${encodeURIComponent(SOMETHING)}&background=...&color=...&size=...
  // Replace with: https://api.dicebear.com/10.x/identicon/svg?seed=${encodeURIComponent(SOMETHING)}
  
  // Match all variations
  code = code.replace(
    /`https:\/\/ui-avatars\.com\/api\/\?name=\$\{encodeURIComponent\(([^)]+)\)\}[^`]*`/g,
    '`https://api.dicebear.com/10.x/identicon/svg?seed=${encodeURIComponent($1)}`'
  );

  if (code !== original) {
    fs.writeFileSync(filePath, code);
    console.log('FIXED: ' + filePath);
  } else {
    console.log('NO CHANGE: ' + filePath);
  }
}

// Fix all files that use ui-avatars.com
fixFile('src/components/home/HomeHeader.tsx');
fixFile('src/components/publish/PublishLayout.tsx');
fixFile('src/routes/ProfilePage.tsx');
fixFile('src/templates/template1/Template1Page.tsx');

// =======================================================
// 2. HomeHeader has a slightly different pattern where
//    it directly inlines session.avatarUrl || fallback
// =======================================================
{
  const filePath = 'src/components/home/HomeHeader.tsx';
  let code = fs.readFileSync(filePath, 'utf8');
  // The HomeHeader has: session.avatarUrl || `https://ui-avatars...`
  // The regex above should have caught the template literal part.
  // But let's also ensure it handles the case where session info is used
  // Let's verify the fix happened by checking
  if (code.includes('ui-avatars.com')) {
    console.log('WARNING: HomeHeader still has ui-avatars references!');
    // manual fix
    code = code.split('https://ui-avatars.com/api/?name=').join('https://api.dicebear.com/10.x/identicon/svg?seed=');
    // Remove the background/color params that don't apply to dicebear
    code = code.replace(/&background=0D8A50&color=fff/g, '');
    fs.writeFileSync(filePath, code);
    console.log('MANUAL FIX: ' + filePath);
  }
}

// =======================================================
// 3. Fix RichArticleCard - replace code preview with
//    DiceBear triangles pattern for code artifacts
// =======================================================
{
  const filePath = 'src/components/home/RichArticleCard.tsx';
  let code = fs.readFileSync(filePath, 'utf8');

  // Replace the entire code preview block. The code section renders a
  // DynamicCodePreview inside a dark container. We want to replace
  // the inner content with a DiceBear triangles image.
  
  // Find and replace the return block for code cards
  const oldCodeReturn = `return (
        <div style={{ height: '220px', display: 'flex', flexDirection: 'column', backgroundColor: '#1e1e1e', overflow: 'hidden', position: 'relative', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
          <div style={{ padding: '16px 16px 8px 16px', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <FontAwesomeIcon icon={IconComponent} style={{ color: langColor, fontSize: '16px' }} />
            <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '14px', textTransform: 'capitalize' }}>{headerLang}</span>
          </div>
          <DynamicCodePreview 
            fileKey={article.fileStorageKey} 
            fallbackSnippet={rawSnippet} 
            bgColor={bgColor} 
            textBase={textBase} 
          />
        </div>
      );`;

  const newCodeReturn = `{
        // Build seed from code snippet or title
        const snippetSeed = rawSnippet ? rawSnippet.split('\\n').slice(0, 2).join(' ') : (article.title || String(article.id));
        const trianglesUrl = \`https://api.dicebear.com/10.x/triangles/svg?seed=\${encodeURIComponent(snippetSeed)}\`;
        return (
        <div style={{ height: '220px', display: 'flex', flexDirection: 'column', backgroundColor: '#1e1e1e', overflow: 'hidden', position: 'relative', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <FontAwesomeIcon icon={IconComponent} style={{ color: langColor, fontSize: '16px' }} />
            <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '14px', textTransform: 'capitalize' }}>{headerLang}</span>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <img src={trianglesUrl} alt="Code Pattern" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      );
      }`;

  if (code.includes('DynamicCodePreview')) {
    code = code.replace(oldCodeReturn, newCodeReturn);
    fs.writeFileSync(filePath, code);
    console.log('FIXED CODE CARD: ' + filePath);
  } else {
    console.log('NO CODE CARD CHANGE: ' + filePath);
  }
}

console.log('\\nAll avatar and code card fixes applied!');
