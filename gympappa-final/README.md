# GympAPPa Final App

Combined sports and gymnasium management system for PERA University.

## Overview

This is the final combined application that integrates all mini-apps into a single, cohesive system with:

- **Frontend**: React + Vite with routing
- **Backend**: Node.js + Express with JWT authentication
- **Database**: PostgreSQL with combined schema
- **Authentication**: Password + Firebase Google Auth

## Features

### Pages
- `/login` - Login page
- `/register` - Register page
- `/dashboard` - Dashboard with request history
- `/request-equipment` - Equipment availability and requests
- `/profile` - User profile management
- `/manage-equipment` - Equipment management (admin/counter-staff)
- `/add-equipment` - Add new equipment (admin/counter-staff)
- `/issue-equipment` - Issue equipment to students (counter-staff)
- `/return-equipment` - Process equipment returns (counter-staff)
- `/my-issued-items` - View issue history (counter-staff)

### API Routes
- `/api/auth/*` - Authentication (login, register, profile)
- `/api/equipment/*` - Equipment availability and requests
- `/api/manage/*` - Equipment CRUD operations
- `/api/admin/*` - Admin operations (issue, return, history)

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Firebase project (for Google Auth)

### Installation

1. Clone or navigate to the project folder
2. Set up the database:
   ```bash
   psql -U your_username -d your_database < database/init.sql
   ```
3. Configure environment variables (create `.env` in backend folder):
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/database_name
   JWT_SECRET=your_jwt_secret
   FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

5. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

### Running the App

1. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```
   Backend runs on http://localhost:5000

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on http://localhost:5173 (proxies to backend)

## Database Schema

The combined schema includes:
- `user` - User accounts and profiles
- `role_request` - Role change requests
- `sports` - Sport categories
- `equipment` - Equipment types
- `sport_equipment` - Equipment instances per sport
- `requested_equipment` - Equipment requests and issue history

## User Roles

- **student** - Can view equipment and make requests
- **games-captain** - Extended student permissions
- **admin** - Full system access
- **counter-staff** - Equipment management and issuing
- **psu** - Sports department staff
- **faculty-coordinator** - Faculty oversight
- **coach** - Coaching staff
- **private-coach** - Private coaching
- **academic-staff** - Academic staff

## Development

The app combines functionality from four mini-apps:
- Login/Profile system
- Equipment availability dashboard
- Equipment management
- Equipment issuing/returning

All existing functionality is preserved and integrated.