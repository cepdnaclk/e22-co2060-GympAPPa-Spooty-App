# ⚡ Quick Start Guide

Get GympAPPa up and running in 5 minutes!

## 🎯 For First-Time Setup

### Step 1: Clone Repository (2 min)
```bash
git clone <repository-url>
cd gympappa-trial2
```

### Step 2: Backend Setup (1 min)
```bash
cd backend
npm install
cp .env.example .env
# Edit .env file with your database credentials
npm run dev
```

### Step 3: Frontend Setup (1 min)
```bash
cd ../frontend
npm install
npm run dev
```

### Step 4: Access Application (1 min)
- Open http://localhost:3000
- Click "Register" to create test user
- Email: `e22018@eng.pdn.ac.lk`
- Try login/logout

**Done!** ✅

---

## 🚀 Running Existing Setup

### Terminal 1 (Backend)
```bash
cd backend
npm run dev
```

### Terminal 2 (Frontend)
```bash
cd frontend
npm run dev
```

### Open Browser
```
http://localhost:3000
```

---

## 📚 Key Files to Know

| What | Where |
|------|-------|
| Start coding... | See DEVELOPMENT_GUIDELINES.md |
| Need API info? | See API_DOCUMENTATION.md |
| Design reference? | See Template.jsx page |
| Complete setup? | See SETUP_CHECKLIST.md |
| Project structure? | See FILE_REFERENCE.md |

---

## ✨ Test User Credentials

After registration with:
- Email: `e22018@eng.pdn.ac.lk`
- Password: Any password you set

Login with:
- User ID: `e22018`
- Password: Same password

---

## 🎨 Color Palette

Always use these CSS variables:
```css
var(--color-light)   /* Light cream */
var(--color-green)   /* Primary green */
var(--color-blue)    /* Secondary blue */
var(--color-pink)    /* Accent pink */
```

---

## 🔌 Making API Calls

```javascript
import { authAPI } from '../utils/api';

// Login
const response = await authAPI.login(credentials);

// Register
const response = await authAPI.register(userData);

// Get profile
const response = await authAPI.getProfile();

// Update profile
const response = await authAPI.updateProfile(data);
```

---

## 📱 Testing Responsive Design

**In Browser DevTools (F12):**

1. Click device toolbar icon (top-left)
2. Select device or adjust width:
   - Mobile: 375px
   - Tablet: 768px
   - Desktop: 1200px+

All components MUST work at all sizes!

---

## 🐛 Common Issues

### Backend won't start
```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill process if needed
kill -9 <PID>
```

### Frontend won't start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Clear cache
npm cache clean --force
rm -rf node_modules
npm install
```

### Database connection error
```bash
# Verify PostgreSQL is running
psql

# Check database exists
psql -d gympappa -c "SELECT * FROM \"user\";"
```

---

## 📋 Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make changes to code

# 3. Test thoroughly (mobile, tablet, desktop)

# 4. Commit changes
git add .
git commit -m "Description of changes"

# 5. Push to remote
git push origin feature/your-feature-name

# 6. Create Pull Request

# 7. Get review and merge
```

---

## ✅ Before Committing

- [ ] Tested on mobile
- [ ] Tested on tablet
- [ ] Tested on desktop
- [ ] No console errors
- [ ] Error states handled
- [ ] Loading states shown
- [ ] API calls working
- [ ] Responsive design works

---

## 🎯 Your First Task

1. **Create a new page** in `frontend/src/pages/NewPage.jsx`
2. **Use Template.jsx** as reference
3. **Add styling** in `frontend/src/styles/newpage.css`
4. **Import in App.jsx** and add route
5. **Add to Navigation.jsx** as link
6. **Test** on all devices
7. **Commit** with descriptive message

---

## 📞 Need Help?

1. Check console for errors (F12)
2. Check backend logs for API issues
3. Review TROUBLESHOOTING in README.md
4. Ask team members or TA

---

## 🚀 Ready? Start Developing!

Next: Choose your feature from DEVELOPMENT_GUIDELINES.md

Happy Coding! 💻
