# GymPappa Spooty App - Backend

## Overview
The GymPappa Spooty App backend manages sports equipment availability for students.  
Built with Node.js, Express, and PostgreSQL.

## Prerequisites
- Node.js (version 14 or higher)
- PostgreSQL (version 12 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/cepdnaclk/e22-co2060-gympappa-spooty-app.git
```

2. Navigate to the backend directory:
```bash
cd code/availability-dashboard/backend
```

3. Install dependencies:
```bash
npm install
```

## Configuration
Create your environment file from the template:

```bash
cp .env.example .env
```

On Windows PowerShell:
```powershell
Copy-Item .env.example .env
```

Edit .env with your actual database credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gympappa_spooty
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
PORT=5000
```

Set up the database:
```bash
psql -U your_username -d gympappa_spooty -f ../database/migrations/initial_schema.sql
psql -U your_username -d gympappa_spooty -f ../database/seeds/equipment_seed.sql
```

## Running the Application
```bash
npm start
```

Server runs on:
http://localhost:5000

## API Endpoints
- GET /api/equipment — Get all equipment grouped by sport
- POST /api/equipment/request — Request equipment
- DELETE /api/equipment/request/:id — Cancel a request
- PATCH /api/equipment/request/:id — Mark as pending return
- PATCH /api/equipment/request/:id/return-approved — Approve return
- GET /api/equipment/history/:studentId — Get student request history

## Folder Structure
```
backend/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   └── equipmentController.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── associations.js
│   │   ├── Equipment.js
│   │   ├── RequestedEquipment.js
│   │   ├── Sport.js
│   │   └── SportEquipment.js
│   └── routes/
│       └── equipmentRoutes.js
└── package.json
```
