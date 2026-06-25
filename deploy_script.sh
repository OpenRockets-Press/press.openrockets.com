
cd ~/press.openrockets.com
export NODE_OPTIONS="--max-old-space-size=512"
npx vite build
pm2 restart all
