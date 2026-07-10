# GympAPPa — Combined App (Updated)

This repository is the merged GympAPPa application (frontend + backend + DB). The app manages sports equipment availability, student requests, and counter-staff issue/return workflows.

This README documents the recent UI/UX and API changes and how to run, test, and troubleshoot the app locally.

---

## Highlights / New Features

- Consolidated counter-staff navigation: three pages for counter staff:
   - `Equipment Stock Overview` — grouped by sport, lists each equipment name with its current available count.
   - `Issue / Return Equipment` — unified staff page showing all active requests (pending / issued / pending_return). Staff can Issue, Decline or Return from this single page.
   - `Issued Items History` — history view per student.
- Student dashboard: shows equipment grouped by sport with only equipment names and current available counts (no Total/Issued columns). Added a search box to filter equipment by name.
- Staff Issue/Return improvements:
   - Staff page loads all active requests by default (no search required).
   - Supports URL filtering: add `?reg=E/22/402` to pre-run a student search.
   - `Issue` button is enabled/disabled using live availability from stock snapshot. After issuing or returning, stock snapshot refreshes.
- Backend: new endpoint `GET /api/admin/requests` returns all active requests; existing per-student route `GET /api/admin/requests/:regNumber` retained.

---

## Important API Endpoints (summary)

- Auth
   - `POST /api/auth/login` — login
   - `POST /api/auth/register` — register
   - `GET /api/auth/profile` — get profile

- Equipment (student)
   - `GET /api/equipment` — grouped equipment list by sport (used by student dashboard)
   - `POST /api/equipment/request` — student requests equipment (creates `pending` request)
   - `DELETE /api/equipment/request/:id` — cancel pending request
   - `GET /api/equipment/history/:studentId` — student request history

- Admin / Counter-staff
   - `GET /api/admin/list` — list all equipment with availability (flat list)
   - `GET /api/admin/requests` — all active requests across students (new)
   - `GET /api/admin/requests/:regNumber` — pending requests for a student
   - `POST /api/admin/accept/:requestId` — accept (issue) a request — transactional; decrements stock
   - `POST /api/admin/decline/:requestId` — decline (cancel) a request
   - `POST /api/admin/return/:requestId` — process return — transactional; increments stock

---

## Local Setup — Prerequisites

- Node.js 18+ (recommended)
- PostgreSQL 13+
- (Optional) Firebase project for Google sign-in

## Environment variables

Backend: create `.env` in `code/backend` with at least these values (example):

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gympappa
DB_USER=postgres
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Frontend: create `.env` in `code/frontend` (or set Vite env) with:

```
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Notes:
- We moved away from a single `DATABASE_URL` string in some backend code; prefer using `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD` to avoid SCRAM/auth issues seen when an empty password or malformed URL is used.

---

## Database — important migration note

The equipment request lifecycle now uses these statuses: `pending`, `issued`, `pending_return`, `returned`, `cancelled`.

If your DB has an older CHECK constraint limiting statuses, run this SQL (replace schema/table names if different):

```sql
ALTER TABLE requested_equipment
   DROP CONSTRAINT IF EXISTS requested_equipment_status_check;

ALTER TABLE requested_equipment
   ADD CONSTRAINT requested_equipment_status_check
   CHECK (status IN ('pending','issued','pending_return','returned','cancelled'));
```

Run with:

```bash
PGPASSWORD=your_db_password psql -U your_db_user -d your_db_name -c "ALTER TABLE ..."

---

## Install & Run (quick)

Backend

```bash
cd code/backend
npm install
npm run dev
# Default: http://localhost:5000
```

Frontend

```bash
cd code/frontend
npm install
npm run dev
# Default: http://localhost:5173 (Vite)
```

Tip: ensure `VITE_API_URL` points to `http://localhost:5000/api` (or use Vite proxy). Frontend axios uses this base.

---

## How to test the main flows quickly

1. Student flow
    - Login as a student, open Dashboard → verify equipment grouped by sport shows equipment names + available counts.
    - Use the search input to find a piece of equipment by name.
    - Request an item via the Request Equipment page — request will be created with status `pending`.

2. Counter-staff flow
    - Login as `counter-staff` and open `Issue / Return Equipment` page.
    - By default, you should see all active requests (pending/issued/pending_return).
    - Click `Issue` for a pending request (button is enabled only if live availability >= requested qty). Issuing sets status to `issued` and decrements stock.
    - When a student returns equipment, click `Return` on the issued record — status becomes `returned` and stock is incremented.
    - To filter quickly by reg number, append `?reg=E/22/402` to the page URL.

3. Verify API responses
    - `curl http://localhost:5000/api/admin/requests` — returns all active requests
    - `curl http://localhost:5000/api/equipment` — returns grouped equipment by sport

---

## Troubleshooting

- 500 on POST `/api/equipment/request`:
   - Ensure the `requested_equipment` status CHECK includes `pending` (see migration note).

- SCRAM authentication errors / empty password:
   - Use `DB_HOST/DB_USER/DB_PASSWORD` in backend `.env` instead of a single `DATABASE_URL` if you encounter client password parsing errors.

- Issue button always disabled for staff:
   - The staff page checks live `remaining_quantity` from `GET /api/admin/list`. Make sure the backend is running and the endpoint returns `remaining_quantity` for each equipment.

- 401 Unauthorized errors in the frontend:
   - Ensure JWT token is set in localStorage after login. Frontend clears token and redirects to `/login` automatically on 401.

If you want, I can also add a small troubleshooting script that validates key endpoints and prints a short health-check summary.

---

## Docs & Next steps

- I recommend removing or updating legacy references to `/return-equipment` in docs; the UI now uses `Issue / Return Equipment` (`/staff-equipment`) for counter-staff workflows.
- If you want backwards compatibility, I can add a route to redirect `/return-equipment` → `/staff-equipment`.

If you'd like, I can commit this README update to the repo and also add a short `scripts/health-check.sh` to validate endpoints on your machine.

---

Maintainers: update this README when you change API names, add new env vars, or change DB migration steps.

