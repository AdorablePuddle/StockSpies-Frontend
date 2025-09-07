# StockSpies Frontend

Vite + React Router app for uploading an image and calling the backend. This repo includes a dev-only mock API so the UI works even if the backend is down.

## Quick Start (Frontend)

```bash
npm install

# Configure backend URL for local dev
cp .env.local .env.local.backup  # optional backup
# Ensure these are present in .env.local
# VITE_BACKEND_URL=http://127.0.0.1:8000/api
# VITE_API_URL=/mock

npm run dev  # http://127.0.0.1:5173
```
