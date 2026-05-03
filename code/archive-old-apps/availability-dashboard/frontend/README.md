# GymPappa Spooty App - Frontend

## Overview
The GymPappa Spooty App frontend provides an Equipment Availability Dashboard for students to request and track sports equipment.  
Built with React.js.

## Prerequisites
- Node.js (version 14 or higher)
- npm

## Installation

1. Navigate to the frontend directory:
```bash
cd code/availability-dashboard/frontend
```

2. Install dependencies:
```bash
npm install
```

## Running the Application
```bash
npm start
```

App runs on:
http://localhost:3000

⚠️ **Note:** Make sure the backend is running on http://localhost:5000 first.

## Features
- View equipment availability grouped by sport
- Request equipment with pickup time
- View request history
- Cancel pending requests
- Role-based navigation menu
- Login protection

## Folder Structure
```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx
│   ├── index.jsx
│   ├── components/
│   │   ├── EquipmentDashboard.jsx
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── Navigation.jsx
│   │   └── logo.PNG
│   ├── pages/
│   │   └── Dashboard.jsx
│   └── styles/
│       ├── App.css
│       ├── footer.css
│       ├── header.css
│       ├── navigation.css
│       └── template.css
└── package.json
```