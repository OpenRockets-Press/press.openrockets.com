const fs = require('fs');
let code = fs.readFileSync('src/templates/template1/Template1Page.tsx', 'utf8');

const licenseFunc = `
  const getLicenseDetails = (licenseKey) => {
    switch (licenseKey) {
      case 'ORP_HUMMINGBIRD':
        return { name: 'OpenRockets® Hummingbird', icon: '/brand/licences/hummingbird.png', link: 'https://press.openrockets.com/licenses/hummingbird' };
      case 'ORP_KANGAROO':
        return { name: 'OpenRockets® Kangaroo', icon: '/brand/licences/kangarooo.png', link: 'https://press.openrockets.com/licenses/kangaroo' };
      case 'CC':
        return { name: 'Creative Commons®', icon: '/brand/licences/creativecommons_usethisforall.png', link: 'https://creativecommons.org/licenses/by/4.0/' };
      case 'ORP_BEAVER':
      default:
        return { name: 'OpenRockets® Beaver', icon: '/brand/licences/beaver,png.png', link: 'https://press.openrockets.com/licenses/beaver' };
    }
  };
  const { name: lName, icon: lIcon, link: lLink } = getLicenseDetails(data?.license || 'ORP_BEAVER');
`;

code = code.replace('const publishDate = data?.submittedAt', licenseFunc + '\n  const publishDate = data?.submittedAt');
code = code.replace('licenseName="OpenRockets® Beaver"', 'licenseName={lName}');
code = code.replace('licenseIcon="/brand/licences/beaver,png.png"', 'licenseIcon={lIcon}');
code = code.replace('licenseLink="https://press.openrockets.com/licenses/beaver"', 'licenseLink={lLink}');

fs.writeFileSync('src/templates/template1/Template1Page.tsx', code);
console.log('Fixed Template1Page license');
