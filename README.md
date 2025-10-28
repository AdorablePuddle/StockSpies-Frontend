# StockSpies Frontend

Vite + React Router app for uploading an image and calling the backend. 

## Quick Start (Frontend)

In order to run npm commands, you'll need [Node.js](https://nodejs.org/en)

```bash
npm install

# Configure backend URL for local dev
cp .env.local .env.local.backup  # optional backup
# Ensure these are present in .env.local
# VITE_BACKEND_URL=http://127.0.0.1:8000/api
# VITE_API_URL=/mock

npm run dev  # http://127.0.0.1:5173
```

## Building for production

Once quickstart runs correctly, to build and run for production, run the following commands:

```bash
npm run build

# Build for production

npm start

# Run that shiiii
```