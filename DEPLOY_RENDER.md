# Deploying On Render

This project is now deployed on Render

Deployment architecture:
- `client/` is deployed as a Render `Static Site`
- `server/` is deployed as a Render `Web Service`
- the frontend connects to the backend over WebSockets using `VITE_WS_URL`

## Live Deployment

Frontend live URL:
- `https://react-chat-bot-front.onrender.com/`

## Changes Made For Deployment

To make this app deployable on Render, these changes were made:

Frontend changes:
- removed the hardcoded `ws://localhost:3001`
- added `getWebSocketUrl()` in [client/src/main.jsx](/Users/soamac/Projects/react-chat-bot/client/src/main.jsx:24)
- frontend now reads `import.meta.env.VITE_WS_URL`
- if no env var is provided, it falls back to the current host using `ws:` or `wss:`

Backend changes:
- updated [server/index.js](/Users/soamac/Projects/react-chat-bot/server/index.js:3) to use `process.env.PORT`
- this is required because Render assigns the port dynamically

Support file added:
- [client/.env.example](/Users/soamac/Projects/react-chat-bot/client/.env.example:1) documents the frontend WebSocket env variable

## What Was Done In Render

The app was deployed in two parts:

1. Backend deployed first as a `Web Service`
2. Frontend deployed second as a `Static Site`
3. Frontend environment variable was set to point to the backend WebSocket URL
4. Frontend was redeployed so Vite could build with that env var

## Step-By-Step Render Deployment

## 1. Push The Project To GitHub

Render deploys directly from GitHub, so the project must be pushed to a GitHub repository.

The repo includes:
- `client/`
- `server/`

## 2. A Render Account Was Created

1. Go to `https://render.com`
2. Sign in with GitHub
3. Authorize Render to access the repository

## 3. Deploy The Backend First

In Render:

1. Click `New +`
2. Select `Web Service`
3. Select the GitHub repository
4. Configure the backend service with:

```text
Name: react-chat-bot-server
Root Directory: server
Environment: Node
Build Command: npm install
Start Command: npm start
```

5. Choose the free instance type
6. Click `Create Web Service`

Why this works:
- [server/index.js](/Users/soamac/Projects/react-chat-bot/server/index.js:3) reads `process.env.PORT`
- Render provides that port automatically at runtime

After deployment, Render provides a backend URL like:

```text
https://your-backend-name.onrender.com
```

Keep this URL for the frontend setup.

## 4. Confirm The Backend Is Running

Open the backend service in Render and check:
- deployment completed successfully
- logs show the server started
- the service is not restarting in a loop

## 5. Deploy The Frontend

In Render:

1. Click `New +`
2. Select `Static Site`
3. Select the same GitHub repository
4. Configure the frontend with:

```text
Name: react-chat-bot-front
Root Directory: client
Build Command: npm install && npm run build
Publish Directory: dist
```

## 6. Add The Frontend Environment Variable

Before using the frontend correctly with the backend, add this variable in the frontend Static Site settings:

```text
Key: VITE_WS_URL
Value: wss://your-backend-name.onrender.com
```

Important:
- use `wss://`
- do not use `https://`
- do not use the frontend URL here

Why this is needed:
- Vite reads `VITE_` variables at build time
- the frontend needs the backend WebSocket URL baked into the build

## 7. Redeploy The Frontend

After adding `VITE_WS_URL`, redeploy the frontend Static Site:

1. Open the frontend service in Render
2. Open `Manual Deploy`
3. Click `Deploy latest commit`

This rebuilds the React app with the environment variable.

## 8. Test The App

1. Open the frontend URL
2. Open the same URL in a second browser tab
3. Send a message from one tab
4. Confirm the message appears in both tabs

## 9. Live Site

The current live frontend is:

`https://react-chat-bot-front.onrender.com/`

## 10. Updating The App Later

When you change code:

1. Commit and push to GitHub
2. Render auto-deploys the linked services
3. If you change frontend environment variables, redeploy the frontend manually

Typical update flow:
- backend code change: Render redeploys backend
- frontend code change: Render rebuilds frontend
- frontend env change: redeploy frontend so Vite rebuilds with new values

## 11. Common Problems

Frontend loads but chat does not connect:
- `VITE_WS_URL` is missing
- `VITE_WS_URL` uses `https://` instead of `wss://`
- frontend was not redeployed after env changes
- backend service is asleep on the free plan

Backend deploy fails:
- wrong root directory
- wrong start command
- dependency install issue

Frontend deploy fails:
- wrong root directory
- wrong publish directory
- missing build command

## 12. Render Notes

On Render free tier:
- static sites are easy to host
- free web services can spin down after inactivity
- first connection after idle time may take longer

That is normal for hobby/demo hosting on Render.
