# Deploying To A VPS

This project can run on a VPS without Vercel.

Architecture:
- `client/` is a Vite React app that builds into static files.
- `server/` is a Node.js WebSocket server.
- `nginx` serves the frontend and proxies `/ws` to the Node server.
- `pm2` keeps the Node server running in the background.

Files added for deployment:
- [ecosystem.config.cjs](/Users/soamac/Projects/react-chat-bot/ecosystem.config.cjs:1) for PM2
- [deploy/nginx/react-chat-bot.conf](/Users/soamac/Projects/react-chat-bot/deploy/nginx/react-chat-bot.conf:1) as the nginx site template
- [client/.env.example](/Users/soamac/Projects/react-chat-bot/client/.env.example:1) for optional frontend env config

## 1. What Was Changed In The App

Frontend:
- it no longer hardcodes `ws://localhost:3001`
- it now uses `VITE_WS_URL` if set
- otherwise it auto-connects to `/ws` on the same domain

Backend:
- it now supports `PORT` from the environment

That means:
- local development still works
- production works through nginx with `wss://your-domain.com/ws`

## 2. What You Need Before Starting

Recommended stack:
- Ubuntu 22.04 or 24.04 VPS
- a domain name pointing to the VPS IP
- Node.js 20
- nginx
- pm2

Example server paths used in this guide:
- project path: `/var/www/react-chat-bot`
- backend port: `3001`

## 3. Step 1: SSH Into The VPS

```bash
ssh root@YOUR_SERVER_IP
```

If you use a non-root user:

```bash
ssh your-user@YOUR_SERVER_IP
```

## 4. Step 2: Update The Server

```bash
apt update && apt upgrade -y
```

This updates system packages before installing anything else.

## 5. Step 3: Install Required Software

Install base packages:

```bash
apt install -y nginx git curl
```

Install Node.js 20:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

Verify installation:

```bash
node -v
npm -v
```

Install PM2 globally:

```bash
npm install -g pm2
```

## 6. Step 4: Point Your Domain To The VPS

In your domain provider:
- create an `A` record for `your-domain.com`
- point it to your VPS public IP
- optionally create another `A` record for `www`

Wait until DNS resolves to your server IP.

You can verify from your machine with:

```bash
nslookup your-domain.com
```

## 7. Step 5: Upload Or Clone The Project

Move to the web root:

```bash
cd /var/www
```

Clone the repo:

```bash
git clone YOUR_REPO_URL react-chat-bot
cd react-chat-bot
```

If you are not using Git, upload the project into:

```text
/var/www/react-chat-bot
```

## 8. Step 6: Install Project Dependencies

Install frontend dependencies:

```bash
cd /var/www/react-chat-bot/client
npm install
```

Install backend dependencies:

```bash
cd /var/www/react-chat-bot/server
npm install
```

## 9. Step 7: Decide How The Frontend Connects To WebSockets

### Recommended option

Do nothing extra here.

Why:
- the frontend already falls back to `/ws`
- nginx will proxy `/ws` to your Node server
- after SSL, the browser will use `wss://` automatically

### Optional explicit option

If you want the frontend to use a specific WebSocket URL, create:

```text
client/.env.production
```

with:

```env
VITE_WS_URL=wss://your-domain.com/ws
```

For most VPS deployments, this file is not necessary.

## 10. Step 8: Build The Frontend

Run:

```bash
cd /var/www/react-chat-bot/client
npm run build
```

This creates:

```text
/var/www/react-chat-bot/client/dist
```

nginx will serve files from that folder.

## 11. Step 9: Start The Backend With PM2

This repo already includes:

```text
/var/www/react-chat-bot/ecosystem.config.cjs
```

Start the backend:

```bash
cd /var/www/react-chat-bot
pm2 start ecosystem.config.cjs
```

Check status:

```bash
pm2 list
```

View logs:

```bash
pm2 logs react-chat-bot-server
```

Make PM2 survive reboots:

```bash
pm2 save
pm2 startup
```

PM2 will print a command. Run that printed command once.

Useful PM2 commands:

```bash
pm2 restart react-chat-bot-server
pm2 stop react-chat-bot-server
pm2 delete react-chat-bot-server
```

## 12. Step 10: Configure Nginx Using The Repo Template

This repo already includes:

```text
/var/www/react-chat-bot/deploy/nginx/react-chat-bot.conf
```

Open the file:

```bash
nano /var/www/react-chat-bot/deploy/nginx/react-chat-bot.conf
```

Replace:

```text
your-domain.com
```

with your real domain name.

Then copy it into nginx:

```bash
cp /var/www/react-chat-bot/deploy/nginx/react-chat-bot.conf /etc/nginx/sites-available/react-chat-bot
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/react-chat-bot /etc/nginx/sites-enabled/react-chat-bot
```

If the default nginx site is still enabled, remove it:

```bash
rm /etc/nginx/sites-enabled/default
```

Test the config:

```bash
nginx -t
```

Reload nginx:

```bash
systemctl reload nginx
```

## 13. Step 11: Add HTTPS With Let's Encrypt

Install Certbot:

```bash
apt install -y certbot python3-certbot-nginx
```

Request certificates:

```bash
certbot --nginx -d your-domain.com -d www.your-domain.com
```

After this:
- your site will load on HTTPS
- the browser will use `wss://` for WebSockets

## 14. Step 12: Test The Deployment

Open:

```text
https://your-domain.com
```

Then test:
1. open the site in two browser tabs
2. send a message from tab one
3. confirm the message appears in both tabs

If chat does not connect, check:

```bash
pm2 logs react-chat-bot-server
nginx -t
tail -f /var/log/nginx/error.log
```

## 15. Step 13: Deploy Updates Later

Pull the latest code:

```bash
cd /var/www/react-chat-bot
git pull
```

Reinstall and rebuild the frontend:

```bash
cd /var/www/react-chat-bot/client
npm install
npm run build
```

Reinstall backend packages if needed and restart PM2:

```bash
cd /var/www/react-chat-bot/server
npm install
cd /var/www/react-chat-bot
pm2 restart react-chat-bot-server
```

## 16. What Each Part Does

`client/dist`
- the built frontend files served to visitors

`server/index.js`
- the WebSocket server handling real-time chat

`pm2`
- keeps the Node server alive and restarts it if it crashes

`nginx`
- serves the frontend and forwards `/ws` to port `3001`

`certbot`
- adds HTTPS so browsers can securely connect to your site

## 17. Very Common Problems

Site opens but chat does not connect:
- PM2 process is not running
- nginx `/ws` proxy is missing or wrong
- SSL is enabled on the site but WebSocket is still trying plain `ws://`

nginx config test fails:
- the domain config was edited incorrectly
- a symlink already exists
- another site config is conflicting

Old frontend still appears:
- `npm run build` was not run after code changes
- nginx root path is wrong
- browser cache needs a hard refresh

## 18. Local Development Reminder

For local development, you can still use:

Frontend:

```bash
cd client
npm run dev
```

Backend:

```bash
cd server
npm run dev
```

If you want the frontend to connect locally using an env file, create:

```text
client/.env.local
```

with:

```env
VITE_WS_URL=ws://localhost:3001
```
