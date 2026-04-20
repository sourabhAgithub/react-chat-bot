# React Chat Bot

A simple real-time chat application built with React on the frontend and Node.js WebSockets on the backend.

## Live Demo

Frontend:
- `https://react-chat-bot-front.onrender.com/`

## Project Structure

```text
react-chat-bot/
├── client/   # React + Vite frontend
├── server/   # Node.js WebSocket backend
└── README.md
```

## Features

- real-time chat using WebSockets
- multiple clients receive messages instantly
- simple user name input
- lightweight React frontend
- Node.js backend using `ws`

## Tech Stack

Frontend:
- React
- Vite

Backend:
- Node.js
- ws

Hosting:
- Render Static Site for the frontend
- Render Web Service for the backend

## Deployment Changes Made

A few changes were made so the project could run in production on Render.

Frontend:
- replaced the hardcoded local WebSocket URL
- added support for `VITE_WS_URL`
- added a fallback that uses the current browser host with `ws:` or `wss:`

Backend:
- updated the server to read `process.env.PORT`

These changes are important because:
- Render assigns backend ports dynamically
- the frontend needs the deployed backend WebSocket URL during build

## How The App Works

1. The React frontend opens a WebSocket connection
2. The Node.js server accepts client connections
3. When one client sends a message, the server broadcasts it to all connected clients
4. Every connected browser receives the new message immediately

## Local Development

### Run the backend

```bash
cd server
npm install
npm run dev
```

### Run the frontend

```bash
cd client
npm install
npm run dev
```

Optional local env file:

Create `client/.env.local` with:

```env
VITE_WS_URL=ws://localhost:3001
```

## Render Deployment Summary

Backend Render settings:

```text
Service Type: Web Service
Root Directory: server
Build Command: npm install
Start Command: npm start
```

Frontend Render settings:

```text
Service Type: Static Site
Root Directory: client
Build Command: npm install && npm run build
Publish Directory: dist
```

Frontend environment variable:

```env
VITE_WS_URL=wss://your-backend-name.onrender.com
```

After adding or changing `VITE_WS_URL`, redeploy the frontend so Vite rebuilds with the new value.

## Deployment Guide

The detailed deployment steps are documented in [DEPLOY_VPS.md](/Users/soamac/Projects/react-chat-bot/DEPLOY_VPS.md:1).
