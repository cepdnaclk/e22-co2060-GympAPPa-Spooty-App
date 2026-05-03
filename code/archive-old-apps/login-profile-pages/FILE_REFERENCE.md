# 📁 Complete Folder Structure Reference

## Project Tree Overview

```
gympappa-trial2/
│
├── 📄 README.md                          # Main documentation
├── 📄 SETUP_CHECKLIST.md                 # Setup verification steps
├── 📄 DEVELOPMENT_GUIDELINES.md          # Team coding guidelines
├── 📄 API_DOCUMENTATION.md               # API reference
├── 📄 FILE_REFERENCE.md                  # This file
│
├── backend/                              # Express.js server
│   ├── 📄 index.js                       # Main server file
│   ├── 📄 package.json                   # Dependencies
│   ├── 📄 .env.example                   # Environment template
│   ├── 📄 .gitignore                     # Git ignore rules
│   │
│   ├── controllers/                      # Business logic
│   │   └── 📄 authController.js          # Auth operations
│   │       ├── registerUser()            # Create new user
│   │       ├── loginUser()               # Authenticate user
│   │       ├── getUserProfile()          # Fetch user data
│   │       ├── updateUserProfile()       # Update profile
│   │       └── verifyFirebaseToken()     # Firebase verification
│   │
│   ├── routes/                           # API endpoints
│   │   └── 📄 auth.js                    # Auth routes
│   │       ├── POST /register            # Register endpoint
│   │       ├── POST /login               # Login endpoint
│   │       ├── GET /profile              # Get profile endpoint
│   │       ├── PUT /profile              # Update profile endpoint
│   │       └── POST /verify-firebase     # Firebase endpoint
│   │
│   ├── middleware/                       # Middleware functions
│   │   └── 📄 auth.js                    # Authentication
│   │       ├── authenticateToken()       # Verify JWT
│   │       └── authorizeRole()           # Check permissions
│   │
│   └── utils/                            # Utility functions
│       ├── 📄 database.js                # Database connection pool
│       ├── 📄 passwordUtils.js           # Password hashing
│       │   ├── hashPassword()            # Hash with bcrypt
│       │   └── comparePassword()         # Verify password
│       ├── 📄 jwtUtils.js                # JWT operations
│       │   ├── generateToken()           # Create JWT
│       │   └── verifyToken()             # Validate JWT
│       └── 📄 userUtils.js               # User utilities
│           ├── extractFacultyAndBatch()  # Parse user ID
│           ├── validateUniversityEmail() # Email validation
│           └── extractUserIdFromEmail()  # Get user ID from email
│
├── frontend/                             # React.js client
│   ├── 📄 index.html                     # HTML template
│   ├── 📄 vite.config.js                 # Vite configuration
│   ├── 📄 package.json                   # Dependencies
│   ├── 📄 .gitignore                     # Git ignore rules
│   │
│   └── src/                              # React source
│       ├── 📄 main.jsx                   # React entry point
│       ├── 📄 App.jsx                    # Main app router
│       │   ├── <BrowserRouter>           # Routing setup
│       │   ├── <Routes>                  # Route definitions
│       │   ├── <ProtectedRoute>          # Auth check
│       │   └── Navigation Setup          # Header/Footer
│       │
│       ├── config/                       # Configuration
│       │   └── 📄 firebase.js            # Firebase setup
│       │       ├── initializeApp()       # Initialize
│       │       ├── getAuth()             # Get auth instance
│       │       └── googleProvider        # Google auth
│       │
│       ├── components/                   # Reusable components
│       │   ├── 📄 Header.jsx             # App header
│       │   │   ├── Logo section          # Branding
│       │   │   ├── Navigation links      # Quick nav
│       │   │   └── Profile picture       # User image + menu
│       │   ├── 📄 Footer.jsx             # App footer
│       │   │   ├── Company info          # About section
│       │   │   ├── Quick links           # Footer nav
│       │   │   ├── Contact info          # Contact details
│       │   │   └── Social links          # Social media
│       │   └── 📄 Navigation.jsx         # Side navigation
│       │       ├── Dashboard link        # Main dashboard
│       │       ├── Equipment links       # Equipment pages
│       │       └── Profile link          # User profile
│       │
│       ├── pages/                        # Full page components
│       │   ├── 📄 Login.jsx              # Login page
│       │   │   ├── Username/Password     # Form fields
│       │   │   ├── Google Sign-In        # Firebase integration
│       │   │   └── Register link         # Go to register
│       │   ├── 📄 Register.jsx           # Sign up page
│       │   │   ├── Email validation      # University email
│       │   │   ├── Auto user ID          # ID generation
│       │   │   ├── Password fields       # Security
│       │   │   └── Login link            # Go to login
│       │   ├── 📄 Profile.jsx            # User profile page
│       │   │   ├── Profile picture       # Display/upload
│       │   │   ├── Basic info            # Name, email, etc
│       │   │   ├── Contact info          # Phone, email, etc
│       │   │   ├── Faculty info          # Extracted data
│       │   │   └── Edit mode             # Update profile
│       │   └── 📄 Template.jsx           # Template reference
│       │       ├── Card layout           # Example cards
│       │       ├── Table example         # Data tables
│       │       ├── Form example          # Form structure
│       │       └── Color showcase        # Theme display
│       │
│       ├── styles/                       # CSS files
│       │   ├── 📄 global.css             # Global styles
│       │   │   ├── Color variables       # --color-*
│       │   │   ├── Base styles           # Reset & base
│       │   │   ├── Typography            # Fonts & sizing
│       │   │   └── Utilities             # Helper classes
│       │   ├── 📄 header.css             # Header styling
│       │   │   ├── Header layout         # Flex/grid
│       │   │   ├── Logo styling          # Branding
│       │   │   └── Profile section       # User menu
│       │   ├── 📄 footer.css             # Footer styling
│       │   │   ├── Footer grid           # Multi-column
│       │   │   ├── Links styling         # Hover effects
│       │   │   └── Bottom bar            # Copyright area
│       │   ├── 📄 navigation.css         # Menu styling
│       │   │   ├── Menu layout           # Flex layout
│       │   │   ├── Active states         # Current page
│       │   │   └── Mobile toggle         # Hamburger
│       │   ├── 📄 auth.css               # Login/Register
│       │   │   ├── Form layout           # Two-column
│       │   │   ├── Input styling         # Form elements
│       │   │   ├── Google button         # OAuth button
│       │   │   └── Info cards            # Side cards
│       │   ├── 📄 profile.css            # Profile page
│       │   │   ├── Profile grid          # Layout
│       │   │   ├── Picture styling       # Avatar
│       │   │   ├── Form styling          # Edit form
│       │   │   └── Info display          # View mode
│       │   └── 📄 template.css           # Template showcase
│       │       ├── Card styles           # Example cards
│       │       ├── Table styles          # Data table
│       │       ├── Color swatches        # Theme
│       │       └── Typography demo       # Text samples
│       │
│       └── utils/                        # Utility functions
│           ├── 📄 api.js                 # API client
│           │   ├── axios instance        # Base config
│           │   ├── authAPI object        # Auth endpoints
│           │   └── Interceptors          # Token injection
│           ├── 📄 helpers.js             # Helper functions
│           │   ├── extractFacultyAndBatch()
│           │   ├── validateEmail()
│           │   ├── extractUserIdFromEmail()
│           │   └── getRoleDisplayName()
│           └── 📄 config.js              # App configuration (if needed)
│
└── database/                             # Database files
    └── 📄 init.sql                       # Schema initialization
        ├── user table                    # User data
        ├── role_request table            # Role requests
        ├── Indexes                       # Performance
        └── Triggers                      # Auto-update
```

## File Descriptions

### Backend Files

| File | Purpose |
|------|---------|
| `index.js` | Express server entry point, middleware setup, route mounting |
| `authController.js` | Handles registration, login, profile operations |
| `auth.js` (routes) | Defines API endpoints and their handlers |
| `auth.js` (middleware) | JWT verification and role authorization |
| `database.js` | PostgreSQL connection pool configuration |
| `passwordUtils.js` | Bcrypt password hashing and comparison |
| `jwtUtils.js` | JWT token generation and verification |
| `userUtils.js` | Faculty parsing, email validation, ID extraction |

### Frontend Components

| Component | Purpose |
|-----------|---------|
| `Header.jsx` | Top bar with logo and user profile management |
| `Footer.jsx` | Bottom bar with company info and links |
| `Navigation.jsx` | Sidebar/top nav with role-based menu items |
| `Login.jsx` | Login form with Firebase integration |
| `Register.jsx` | Registration form with email validation |
| `Profile.jsx` | User profile display and editing |
| `Template.jsx` | Design pattern reference for teammates |

### Style Files

| File | Contains |
|------|----------|
| `global.css` | CSS variables, resets, global utilities |
| `header.css` | Header layout and styling |
| `footer.css` | Footer layout and styling |
| `navigation.css` | Navigation menu styling |
| `auth.css` | Login and register page styling |
| `profile.css` | Profile page layout and styling |
| `template.css` | Template page examples |

## Adding New Features

When adding new features, follow this structure:

```
feature-name/
├── Feature.jsx          # Main component (in pages/)
├── SubComponent.jsx     # Sub-components (in components/)
└── feature.css          # Feature styles (in styles/)
```

### Steps:
1. Create component in appropriate folder
2. Create CSS file with BEM naming
3. Import in App.jsx and add route
4. Test on mobile, tablet, desktop
5. Update Navigation.jsx if needed
6. Document in README

## Code Organization Principles

1. **Separation of Concerns**
   - Controllers: Business logic
   - Routes: Endpoint definitions
   - Utils: Reusable functions
   - Middleware: Cross-cutting concerns

2. **Component Structure**
   - Pages: Full page screens
   - Components: Reusable parts
   - Styles: CSS per component
   - Utils: Helper functions

3. **Naming Conventions**
   - Controllers: `*Controller.js`
   - Routes: `*.js`
   - Components: `ComponentName.jsx`
   - Styles: `component-name.css`
   - Variables: `camelCase`
   - Constants: `UPPER_CASE`

## Dependency Flow

```
App.jsx (main entry)
    ↓
Header + Navigation + Footer (layout)
    ↓
Pages (Login, Register, Profile)
    ↓
Components (reusable)
    ↓
Utils (api.js, helpers.js)
    ↓
External Libraries (React, Firebase, Axios)
```

---

**This structure ensures scalability and team collaboration.**

For more details, see:
- README.md - Project overview
- DEVELOPMENT_GUIDELINES.md - Coding standards
- API_DOCUMENTATION.md - API reference
