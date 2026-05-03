# 🚀 Complete Setup Checklist

Follow this checklist to set up GympAPPa from scratch.

## ✅ Prerequisites Setup

- [ ] Node.js v14+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] PostgreSQL v12+ installed (`psql --version`)
- [ ] Git installed (`git --version`)
- [ ] VS Code or preferred IDE installed
- [ ] Firebase account created

## ✅ Database Setup (PostgreSQL)

### Option A: Using Command Line

```bash
# Create database
createdb gympappa

# Connect to database and run init script
psql -d gympappa -f database/init.sql

# Verify tables were created
psql -d gympappa -c "\dt"
```

### Option B: Using pgAdmin

- [ ] Open pgAdmin
- [ ] Right-click "Databases" → Create → Database
- [ ] Name: `gympappa`
- [ ] Right-click new database → Query Tool
- [ ] Open `database/init.sql` and execute
- [ ] Close Query Tool

### Option C: Using DBeaver (If installed)

- [ ] Create new database connection to PostgreSQL
- [ ] Name: `gympappa`
- [ ] Right-click database → SQL Editor → New Script
- [ ] Copy contents of `database/init.sql`
- [ ] Execute the script

## ✅ Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```
- [ ] Command completed without errors
- [ ] `node_modules` folder created
- [ ] `package-lock.json` updated

### 2. Configure Environment
```bash
# Create .env from template
cp .env.example .env

# Edit .env with your values
```

Edit `.env` file with:
- [ ] `DATABASE_URL=postgresql://username:password@localhost:5432/gympappa`
- [ ] `JWT_SECRET=your_secure_random_key_here_at_least_32_chars`
- [ ] `PORT=5000`
- [ ] `FIREBASE_PROJECT_ID=gympappa-trial2`

**Generate secure JWT_SECRET:**
```bash
# On Mac/Linux
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# On Windows PowerShell
[Convert]::ToBase64String((1..32|ForEach{[byte](Get-Random -Max 256)}))
```

### 3. Test Backend
```bash
npm run dev
```
- [ ] Server starts without errors
- [ ] Message shows: "Server running on http://localhost:5000"
- [ ] Health check works: `curl http://localhost:5000/api/health`

### 4. Stop Backend (for now)
```bash
Ctrl+C to stop the server
```

## ✅ Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```
- [ ] Command completed without errors
- [ ] `node_modules` folder created

### 2. Verify Firebase Config
Check `frontend/src/config/firebase.js`:
- [ ] Firebase configuration present
- [ ] API key visible
- [ ] Project ID: `gympappa-trial2`

### 3. Test Frontend
```bash
npm run dev
```
- [ ] Development server starts
- [ ] Message shows: "Local: http://localhost:3000"
- [ ] Browser opens automatically or navigate to URL

### 4. Navigate Application
- [ ] Landing page shows "Welcome Back" (Login)
- [ ] Click "Register here" → Register page loads
- [ ] Click "Login" → Back to login
- [ ] All styling looks correct

### 5. Stop Frontend
```bash
Ctrl+C to stop the server
```

## ✅ Test Complete Flow

### 1. Start Backend
```bash
cd backend
npm run dev
```
- [ ] Backend running on port 5000

### 2. Start Frontend (another terminal)
```bash
cd frontend
npm run dev
```
- [ ] Frontend running on port 3000

### 3. Register New User
- [ ] Navigate to Register page
- [ ] University Email: `e22018@eng.pdn.ac.lk`
- [ ] Full Name: `Test User`
- [ ] Password: `TestPassword123`
- [ ] Confirm Password: `TestPassword123`
- [ ] Click Register
- [ ] See success message
- [ ] Redirected to profile page
- [ ] User ID shows: `e22018`
- [ ] Faculty shows: `Faculty of Engineering`
- [ ] Batch shows: `2022`

### 4. Test Profile
- [ ] Profile picture placeholder shows
- [ ] Edit Profile button available
- [ ] Click Edit Profile
- [ ] Can update name, phone, email, district
- [ ] Save changes
- [ ] Changes reflected in profile view

### 5. Logout and Login
- [ ] Click profile picture → Logout
- [ ] Redirected to Login page
- [ ] User ID: `e22018`
- [ ] Password: `TestPassword123`
- [ ] Click Login
- [ ] Redirected to Dashboard
- [ ] User profile shows correct information

## ✅ Git Setup

### 1. Initialize Repository
```bash
cd ..
git init
git add .
git commit -m "Initial commit: GympAPPa auth system"
```
- [ ] Repository initialized
- [ ] All files committed

### 2. Add Remote (Optional)
```bash
git remote add origin https://github.com/your-username/gympappa.git
git push -u origin main
```
- [ ] Remote added (if using GitHub)

## ✅ Team Setup

### 1. Share Repository
- [ ] Push to GitHub/GitLab
- [ ] Share link with team members
- [ ] Add team members as collaborators

### 2. Team Member Clone
```bash
git clone https://github.com/your-username/gympappa.git
cd gympappa
```
- [ ] Repository cloned

### 3. Team Member Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with database info
npm run dev
```

### 4. Team Member Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

## ✅ Development Configuration

### VS Code Extensions (Recommended)
- [ ] Install "ES7+ React/Redux/React-Native snippets"
- [ ] Install "Prettier - Code formatter"
- [ ] Install "ESLint"
- [ ] Install "Thunder Client" (for API testing)

### VS Code Settings
Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```
- [ ] File created

### Browser DevTools
- [ ] Open DevTools (F12)
- [ ] Go to Application tab
- [ ] Check localStorage for token after login
- [ ] Check Console for errors
- [ ] Use Network tab to debug API calls

## ✅ Documentation Review

- [ ] Read README.md
- [ ] Review DEVELOPMENT_GUIDELINES.md
- [ ] Review API_DOCUMENTATION.md
- [ ] Study Template.jsx component
- [ ] Review color scheme and styling

## ⚠️ Troubleshooting Checklist

### Backend Issues
- [ ] Database connection working (`psql -d gympappa`)
- [ ] Port 5000 not in use (`lsof -i :5000`)
- [ ] All dependencies installed (`npm ls` check)
- [ ] .env file has correct DATABASE_URL
- [ ] NODE_ENV not restricting development

### Frontend Issues
- [ ] Port 3000 not in use (`lsof -i :3000`)
- [ ] Dependencies installed (`npm ls` check)
- [ ] Cache cleared (Ctrl+Shift+Del)
- [ ] Browser supports ES6+ (modern browser)
- [ ] API calls reaching backend (check Network tab)

### Database Issues
- [ ] PostgreSQL service running
- [ ] Database `gympappa` exists
- [ ] Tables created successfully (`\dt` in psql)
- [ ] User has proper permissions
- [ ] No firewall blocking localhost connections

## ✅ First Feature Development

Now that setup is complete, team members can:

1. **Akeela (You)**: Continue with authentication refinements
2. **Team Member 1**: Start Equipment Management pages
3. **Team Member 2**: Start Equipment Request system
4. **Team Member 3**: Start Equipment Tracking system

Each should:
- [ ] Create feature branch: `git checkout -b feature/name`
- [ ] Use Template.jsx as reference
- [ ] Follow DEVELOPMENT_GUIDELINES.md
- [ ] Test thoroughly before PR
- [ ] Request review from team

## 🎉 Setup Complete!

Once all checkboxes are marked:
- [ ] System is ready for development
- [ ] Team can start working on features
- [ ] Documentation is reviewed
- [ ] IDE is configured
- [ ] Database is working
- [ ] Both servers start successfully
- [ ] Test flow completed successfully

**Next Steps:**
1. Create feature branches
2. Start implementation
3. Regular commits and PRs
4. Code reviews before merging
5. Test thoroughly

---

**Good luck! 🚀**

If you get stuck, check TROUBLESHOOTING section in README.md
