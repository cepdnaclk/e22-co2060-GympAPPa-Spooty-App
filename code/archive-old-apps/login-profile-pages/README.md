# GympAPPa - PERA Sports and Gymnasium Management System

Welcome to GympAPPa! This is a comprehensive sports equipment management system designed for the University of Peradeniya's PERA (Physical Education and Recreation Association).

## 🎯 Project Overview

GympAPPa manages sports equipment, facilities, and user roles across the university. The system supports role-based access, real-time equipment tracking, Firebase Google Sign-In for registration, and traditional user ID/password login after the password is set from the profile page.

### Current Session Focus
**Session 1: Authentication & Profile Management**
- User registration and login system
- Role-based access control
- User profile management
- Equipment management foundation

## 📋 Prerequisites

Before you begin, ensure you have:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/)
- **npm** or **yarn** package manager
- **Git** for version control

## 🏗️ Project Structure

```
gympappa-trial2/
├── backend/                 # Express.js backend server
│   ├── controllers/        # Business logic
│   ├── routes/            # API routes
│   ├── middleware/        # Authentication & validation
│   ├── utils/             # Helper functions
│   ├── index.js           # Main server file
│   └── package.json       # Backend dependencies
├── frontend/               # React.js frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Full page components
│   │   ├── styles/        # CSS stylesheets
│   │   ├── utils/         # Helper functions
│   │   ├── config/        # Firebase configuration
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── index.html         # HTML template
│   ├── vite.config.js     # Vite configuration
│   └── package.json       # Frontend dependencies
└── database/              # Database files
    └── init.sql           # Database schema
```

## 🚀 Setup Instructions

### 1. Backend Setup

#### Step 1.1: Install Dependencies
```bash
cd backend
npm install
```

#### Step 1.2: Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/gympappa
JWT_SECRET=your_very_secure_secret_key_change_in_production
PORT=5000
FIREBASE_PROJECT_ID=gympappa-trial2
```

#### Step 1.3: Create Database
```bash
# Create database using PostgreSQL
createdb gympappa

# Initialize schema
psql -d gympappa -f ../database/init.sql
```

Or using pgAdmin:
1. Create a new database named `gympappa`
2. Open a query tool
3. Copy and paste contents of `database/init.sql`
4. Execute the query

#### Step 1.4: Start Backend Server
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### 2. Frontend Setup

#### Step 2.1: Install Dependencies
```bash
cd frontend
npm install
```

#### Step 2.2: Start Development Server
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

### 3. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 📚 File Descriptions

### Backend Files

**`controllers/authController.js`**
- `registerUser()`: Handles user registration with email validation
- `loginUser()`: Traditional username/password authentication
- `getUserProfile()`: Retrieves user profile with faculty & batch info
- `updateUserProfile()`: Updates user information

**`middleware/auth.js`**
- `authenticateToken()`: Verifies JWT tokens
- `authorizeRole()`: Checks user permissions

**`utils/userUtils.js`**
- `extractFacultyAndBatch()`: Extracts faculty and batch from user ID
- `validateUniversityEmail()`: Validates .pdn.ac.lk email format
- `extractUserIdFromEmail()`: Extracts user ID from email

**`utils/passwordUtils.js`**
- `hashPassword()`: Securely hashes passwords using bcrypt
- `comparePassword()`: Compares plaintext with hashed password

**`utils/jwtUtils.js`**
- `generateToken()`: Creates JWT authentication tokens
- `verifyToken()`: Validates JWT tokens

### Frontend Components

**`components/Header.jsx`**
- Application header with logo and user profile picture
- Profile picture click redirects to profile page
- Logout functionality

**`components/Footer.jsx`**
- Application footer with links and information
- Company details, quick links, social media

**`components/Navigation.jsx`**
- Role-based navigation menu
- Responsive hamburger menu for mobile
- Links to different pages based on user role

**`pages/Login.jsx`**
- Traditional login with user ID and password
- Redirects to profile if the account still needs password setup

**`pages/Register.jsx`**
- Firebase Google-only registration
- University email validation after Google sign-in
- Redirects to profile so the user can set their app password

**`pages/Profile.jsx`**
- User profile display and editing
- Profile picture upload
- Contact information management
- Faculty and batch information display
- Password setup/change for later user ID/password login
- Role request functionality (template)

**`pages/Template.jsx`**
- Template page showcasing design patterns
- Example of cards, tables, forms
- Color palette reference
- For your teammates to use as reference

## 🔐 User Roles

The system supports 9 different user roles:

| Role | Code | Description |
|------|------|-------------|
| Student | `student` | Default role for new users |
| Games Captain | `games-captain` | Captain of sports team |
| Administrator | `admin` | System administrator |
| Sports Counter Staff | `counter-staff` | Equipment issuing staff |
| PSU | `psu` | Physical Sports Unit staff |
| Faculty Coordinator | `faculty-cordinator` | Faculty representative |
| Coach | `coach` | Sports coach |
| Private Coach | `private-coach` | External coach |
| Academic Staff | `academic-staff` | Faculty member |

## 🎓 Faculty Codes

User IDs encode faculty information:

| Code | Faculty |
|------|---------|
| A | Arts |
| AHS | Allied Health Sciences |
| M | Medicine |
| E | Engineering |
| S | Science |
| MG | Management |
| AG | Agriculture |
| VS | Veterinary & Animal Science |
| D | Dental |

**Example User IDs:**
- `e22018`: Engineering Faculty, 2022 Batch
- `m20045`: Medicine Faculty, 2020 Batch
- `s21087`: Science Faculty, 2021 Batch

## 🎨 Color Scheme

The application uses the following color palette:

```
Primary Light:  rgb(244, 240, 228)  #F4F0E4
Primary Green:  rgb(68, 161, 148)   #44A194
Primary Blue:   rgb(83, 125, 150)   #537D96
Primary Pink:   rgb(236, 143, 141)  #EC8F8D
```

Use these colors consistently throughout the application.

## 📧 Email Validation

The system only accepts university emails with the `.pdn.ac.lk` domain:
- ✅ `e22018@eng.pdn.ac.lk` (Valid)
- ✅ `m20045@med.pdn.ac.lk` (Valid)
- ❌ `student@gmail.com` (Invalid)
- ❌ `user@pdn.ac.lk` (Valid format, but domain name differs)

## 🔑 API Endpoints

### Authentication Routes

**POST** `/api/auth/register`
```json
{
  "email": "e22018@eng.pdn.ac.lk",
  "password": "securePassword123",
  "name": "John Doe"
}
```

This endpoint is now disabled for manual signup. Use Google sign-in on the registration page instead.

**POST** `/api/auth/login`
```json
{
  "userId": "e22018",
  "password": "securePassword123"
}
```

**GET** `/api/auth/profile` (Protected)
- Returns user profile with faculty and batch information

**PUT** `/api/auth/profile` (Protected)
```json
{
  "name": "Updated Name",
  "tel": "+94XXXXXXXXX",
  "personalEmail": "john@gmail.com",
  "district": "Kandy",
  "profilePicture": "base64_image_data"
}
```

**PUT** `/api/auth/profile/password` (Protected)
```json
{
  "currentPassword": "optional_current_password",
  "password": "newSecurePassword123",
  "confirmPassword": "newSecurePassword123"
}
```

**POST** `/api/auth/verify-firebase`
```json
{
  "firebaseToken": "firebase_token_here"
}
```

## 💾 Database Schema

### User Table
```sql
user (
  user_id VARCHAR(20) PRIMARY KEY,
  role VARCHAR(50),
  university_email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  password VARCHAR(255) NULL,
  password_set BOOLEAN,
  auth_provider VARCHAR(20),
  firebase_uid VARCHAR(255) UNIQUE,
  profile_picture TEXT,
  tel VARCHAR(20),
  personal_email VARCHAR(255),
  district VARCHAR(100),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Role Request Table
```sql
role_request (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(20) FOREIGN KEY,
  requested_role VARCHAR(50),
  status VARCHAR(20),
  created_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by VARCHAR(20) FOREIGN KEY
)
```

## 🔒 Security Considerations

1. **Password Hashing**: All passwords are hashed using bcrypt with 10 salt rounds
2. **JWT Tokens**: Uses JWT for stateless authentication with 7-day expiration
3. **Case Insensitivity**: User IDs are converted to lowercase for consistency
4. **Email Validation**: Strict validation for university email domain
5. **Environment Variables**: Sensitive data stored in `.env` file (never commit)
6. **Firebase Onboarding**: Google sign-in is used only for account creation and first-time identity proofing
7. **CORS**: Configured to only accept requests from your frontend

## 🖥️ Frontend Development Guidelines

### Adding New Pages

1. Create a new file in `frontend/src/pages/YourPage.jsx`
2. Use the Template.jsx as reference
3. Import and add route to `App.jsx`
4. Create corresponding CSS in `frontend/src/styles/yourpage.css`

Example:
```jsx
import { useState } from 'react';
import '../styles/yourpage.css';

const YourPage = () => {
  const [state, setState] = useState(null);

  return (
    <div className="your-page">
      <h1>Your Page Title</h1>
      {/* Your content here */}
    </div>
  );
};

export default YourPage;
```

### Using the API

```javascript
import { authAPI } from '../utils/api';

// Make authenticated requests
const response = await authAPI.getProfile();
const updatedUser = await authAPI.updateProfile(data);
```

### Responsive Design

Always test on:
- 📱 **Mobile** (320px - 480px)
- 📱 **Tablet** (481px - 768px)
- 💻 **Desktop** (769px+)

Use provided media queries in CSS files.

## 🐛 Troubleshooting

### Backend Issues

**"Cannot find module 'pg'"**
- Run: `npm install`

**"Connection refused to localhost:5432"**
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env

**"Port 5000 already in use"**
- Change PORT in .env or kill process: `lsof -i :5000`

### Frontend Issues

**"Cannot find module 'react'"**
- Run: `npm install` in frontend directory

**"Port 3000 already in use"**
- Change port in vite.config.js

**CSS not loading**
- Clear browser cache (Ctrl+Shift+K in Chrome)
- Restart development server

## 📦 Deployment

### Building for Production

**Backend:**
```bash
npm install --production
```

**Frontend:**
```bash
npm run build
```

This creates a `dist/` folder with optimized build.

## 👥 Team Collaboration

### For Your Teammates

When creating new pages:

1. **Use the Template.jsx** as your reference
2. **Follow the color scheme** from global.css
3. **Maintain responsive design** for all screen sizes
4. **Use the Navigation component** for page links
5. **Add proper error handling** and loading states
6. **Keep API calls centralized** in utils/api.js

### Directory Convention

```
New Feature/
├── pages/FeatureName.jsx      (Main page component)
├── components/FeatureItem.jsx (Sub-components)
└── styles/feature.css          (Styling)
```

## 📖 Additional Resources

- **React Docs**: https://react.dev
- **Express Docs**: https://expressjs.com
- **Firebase Docs**: https://firebase.google.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

## 📝 Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add feature description"

# Push to remote
git push origin feature/your-feature-name

# Create pull request on GitHub
```

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the relevant documentation file
3. Check browser console for errors (F12)
4. Check server logs for backend issues

## 📄 License

This project is part of the University of Peradeniya course work.

---

**Happy Coding! 🎉**

Built with ❤️ for GympAPPa - Making Sports Equipment Management Easy
