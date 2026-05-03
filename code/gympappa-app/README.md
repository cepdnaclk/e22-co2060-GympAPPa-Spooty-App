# GympAPPa Combined App

This directory combines the existing GympAPPa mini-apps into a single backend and frontend project.

## Structure

- `backend/` — Express API with auth and equipment endpoints
- `frontend/` — React + Vite UI with login, dashboard, availability, equipment request, and profile pages

## Setup

1. Open a terminal in `gympappa-app/backend` and install dependencies:
   ```bash
   npm install
   ```

2. Open a terminal in `gympappa-app/frontend` and install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` in `backend/` and fill in the database and Firebase values.
4. Copy `.env.example` to `.env` in `frontend/` and fill in Firebase web app values.

## Run

- Start backend:
  ```bash
  npm run dev
  ```

- Start frontend:
  ```bash
  npm run dev
  ```

The frontend runs on `http://localhost:5173` by default and calls the backend at `http://localhost:5000`.
