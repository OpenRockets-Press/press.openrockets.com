const { execSync } = require('child_process');
const fs = require('fs');

try {
  // Add the column
  console.log("Adding column...");
  execSync('ssh -i C:/Users/HP/Downloads/ssh-key-2026-06-22.key -o StrictHostKeyChecking=no ubuntu@159.54.171.227 "mysql -u orp_user -pkpwuerjop98yt79RTu86CD654! -h 10.0.0.213 -D openrocketspress -e \\"ALTER TABLE users ADD COLUMN is_suspended BOOLEAN DEFAULT false;\\""', { stdio: 'inherit' });
  console.log("Column added.");
} catch(e) {
  console.log("Column might already exist or error: " + e.message);
}

// Write the build script
const buildScript = `
cd ~/press.openrockets.com
export NODE_OPTIONS="--max-old-space-size=512"
npx vite build
pm2 restart all
`;

fs.writeFileSync('deploy_script.sh', buildScript);

console.log("Uploading and running build script...");
try {
  // Use a simple scp instead of cat
  execSync('scp -i C:/Users/HP/Downloads/ssh-key-2026-06-22.key -o StrictHostKeyChecking=no deploy_script.sh ubuntu@159.54.171.227:~/press.openrockets.com/deploy_script.sh', { stdio: 'inherit' });
  
  execSync('ssh -i C:/Users/HP/Downloads/ssh-key-2026-06-22.key -o StrictHostKeyChecking=no ubuntu@159.54.171.227 "chmod +x ~/press.openrockets.com/deploy_script.sh && nohup ~/press.openrockets.com/deploy_script.sh > ~/press.openrockets.com/build.log 2>&1 < /dev/null &"', { stdio: 'inherit' });
  console.log("Build script triggered successfully!");
} catch(e) {
  console.log("Error running build: " + e.message);
}
