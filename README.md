# AR.js prototype

_Automatically synced with your [v0.app](https://v0.app) deployments_

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/enisenisnisis-projects/v0-ar-js-prototype)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/Bfpqj2zfCAj)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/enisenisnisis-projects/v0-ar-js-prototype](https://vercel.com/enisenisnisis-projects/v0-ar-js-prototype)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/Bfpqj2zfCAj](https://v0.app/chat/projects/Bfpqj2zfCAj)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Cesium (local dev)

This project uses Cesium/Resium for a globe overlay. Cesium expects some static
assets (workers, images, terrain metadata) to be served from a base URL. To make
those assets available in development, copy Cesium's Build files into
`public/cesium` once after installing dependencies:

```bash
# install deps (pnpm is recommended if npm cache is problematic)
pnpm install
pnpm run copy-cesium-assets
```

This will populate `public/cesium` so the dev server can serve files from
`/cesium/*` and avoid file:// requests. The `components/cesium-map.tsx` sets
`window.CESIUM_BASE_URL = '/cesium'` before dynamically loading Cesium.
