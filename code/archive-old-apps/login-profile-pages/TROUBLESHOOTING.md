# 🔧 Comprehensive Troubleshooting Guide

## 🚨 Critical System Issues

### Issue: Backend Server Won't Start

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change PORT in .env
PORT=5001

# Restart
npm run dev
```

**Alternative Windows Solution:**
```bash
# Find port user
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F

# Restart
npm run dev
```

---

### Issue: Database Connection Failed

**Error Message:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Causes & Solutions:**

1. **PostgreSQL not running**:
   ```bash
   # Start PostgreSQL (Mac)
   brew services start postgresql
   
   # Start PostgreSQL (Windows)
   # Open Services → Find PostgreSQL → Start
   
   # Start PostgreSQL (Linux)
   sudo systemctl start postgresql
   ```

2. **PostgreSQL credentials wrong in .env**:
   - Check `DATABASE_URL` format: `postgresql://user:password@localhost:5432/dbname`
   - Verify username and password
   - Ensure database `gympappa` exists:
   ```bash
   psql -l
   ```

3. **Database doesn't exist**:
   ```bash
   # Create database
   createdb gympappa
   
   # Initialize schema
   psql -d gympappa -f database/init.sql
   ```

4. **Port 5432 blocked**:
   - Check firewall settings
   - PostgreSQL might be on different port
   - Check PostgreSQL config: `/etc/postgresql/...`

---

### Issue: Frontend Port 3000 Already in Use

**Error Message:**
```
Port 3000 is already in use. Try another one? (Y/n)
```

**Solution:**
```bash
# Option 1: Use different port
npm run dev -- --port 3001

# Option 2: Kill existing process
lsof -i :3000
kill -9 <PID>

# Option 3: Change in vite.config.js
export default defineConfig({
  server: {
    port: 3001,
    // ...
  }
})
```

---

## 🔐 Authentication Issues

### Issue: Login Always Fails

**Symptoms:**
- "Invalid credentials" even with correct password
- User can register but not login

**Solutions:**

1. **User ID case sensitivity**:
   - User ID must be lowercase
   - Try: `e22018` (not `E22018`)

2. **Database check**:
   ```bash
   psql -d gympappa
   SELECT user_id, email FROM "user";
   ```

3. **Clear browser cache**:
   - Press Ctrl+Shift+Del
   - Clear cookies and cache
   - Reload page

4. **Password not hashed**:
   - Check backend logs
   - Ensure bcryptjs is installed: `npm ls bcryptjs`
   - Restart backend with: `npm run dev`

---

### Issue: "Invalid or Expired Token"

**Causes:**
- Token expired (7 days)
- Token corrupted
- JWT_SECRET changed

**Solutions:**
```bash
# Clear localStorage
localStorage.clear()

# Login again to get new token
# Go to login page and authenticate

# If still failing, check JWT_SECRET in .env
# Make sure it hasn't changed
echo $JWT_SECRET
```

---

### Issue: Firebase Google Sign-In Not Working

**Error Message:**
```
Firebase not initialized or auth not available
```

**Solutions:**

1. **Check Firebase config**:
   ```javascript
   // frontend/src/config/firebase.js
   const firebaseConfig = {
     apiKey: "AIzaSyDaeuMtn3HLc9wqkPkirULm3s60WFmG6ZM",
     // ... other config
   };
   ```

2. **Verify API key is valid**
   - Go to Firebase Console
   - Check Web SDK Key is same
   - Ensure key is unrestricted or includes your domain

3. **Domain whitelist**:
   - Firebase Console → Authentication → Settings
   - Add `localhost:3000` to authorized domains

4. **Browser console error**:
   - Open DevTools (F12) → Console
   - Check exact error message
   - Search Firebase docs for error code

---

### Issue: Email Validation Failing on Register

**Error:** "Please use a valid university email"

**Solutions:**

1. **Email format must be**:
   - `username@domain.pdn.ac.lk`
   - Valid format: `e22018@eng.pdn.ac.lk`
   - Invalid: `e22018@externalmail.com`

2. **Check validation regex**:
   - In `backend/utils/userUtils.js`
   - Must match: `/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.pdn\.ac\.lk$/`

---

## 🌐 Frontend Issues

### Issue: Styles Not Applying

**Symptoms:**
- Components not styled
- Colors not showing
- Layout broken

**Solutions:**

1. **CSS file not imported**:
   ```jsx
   // Make sure this is at top of component
   import '../styles/component.css';
   ```

2. **CSS file not created**:
   - Check file exists in `src/styles/`
   - Filename must match: `component.css`

3. **Browser cache**:
   ```bash
   # Hard refresh
   Ctrl+Shift+R (Windows/Linux)
   Cmd+Shift+R (Mac)
   ```

4. **CSS variables not loaded**:
   ```bash
   # Ensure global.css is imported in main.jsx
   import './styles/global.css'
   ```

---

### Issue: "Cannot find module" Error

**Error Message:**
```
Module not found: Can't resolve '../components/Header'
```

**Solutions:**

1. **Check file path**:
   - Verify file exists at path
   - Check spelling and capitalization
   - Use correct extension: `.jsx`

2. **File location**:
   ```
   ✅ CORRECT
   src/components/Header.jsx
   Import: import Header from '../components/Header'
   
   ❌ INCORRECT
   src/Header.jsx
   Import: import Header from '../Header'
   ```

3. **Node modules**:
   ```bash
   # Reinstall dependencies
   rm -rf node_modules
   npm install
   npm run dev
   ```

---

### Issue: Component Not Rendering

**Symptoms:**
- Blank page
- Component doesn't show up
- "Cannot read property of undefined"

**Solutions:**

1. **Check console for errors** (F12):
   - Read error message carefully
   - Check line number in error
   - Look at stack trace

2. **Component not exported**:
   ```jsx
   // ✅ CORRECT
   export default ComponentName;
   
   // ❌ INCORRECT
   export ComponentName; // Missing 'default'
   ```

3. **Component not imported**:
   ```jsx
   // ✅ CORRECT
   import ComponentName from '../path'
   
   // Make sure component is used in JSX
   return <ComponentName />
   ```

4. **Route not registered**:
   - Check `App.jsx`
   - Ensure route exists: `<Route path="/page" element={<Component />} />`

---

### Issue: API Calls Not Working

**Symptoms:**
- Data not loading
- Network error
- 404 error

**Solutions:**

1. **Check backend is running**:
   ```bash
   curl http://localhost:5000/api/health
   # Should return: {"message":"Server is running"}
   ```

2. **Check API endpoint**:
   - In `frontend/utils/api.js`
   - Endpoint must match backend route
   - Example: `/api/auth/profile`

3. **Token not being sent**:
   - Check localStorage has token
   - Open DevTools → Network tab
   - Check Authorization header
   - Should be: `Authorization: Bearer <token>`

4. **CORS error**:
   ```
   Access to XMLHttpRequest blocked by CORS policy
   ```
   - Backend CORS misconfigured
   - Check `index.js`: `app.use(cors());`
   - Frontend URL must be in allowed origins

---

## 📱 Responsive Design Issues

### Issue: Mobile Layout Broken

**Symptoms:**
- Text overlapping on phone
- Buttons too small
- Horizontal scrolling

**Solutions:**

1. **Test with DevTools**:
   - Open DevTools (F12)
   - Click device icon (top-left)
   - Select mobile device
   - Reload page

2. **Check media queries**:
   ```css
   /* Mobile first approach */
   .container {
     grid-template-columns: 1fr;
   }
   
   @media (max-width: 768px) {
     /* Mobile specific styles */
   }
   ```

3. **Font sizes too small**:
   - Minimum font: 14px on mobile
   - Headers: 18px minimum
   - Buttons: 44x44px minimum

4. **Remove horizontal scrolling**:
   - Check overflow properties
   - Ensure max-width set
   - Use box-sizing: border-box

---

## 🗂️ Database Issues

### Issue: Tables Don't Exist

**Error:**
```
Error: relation "user" does not exist
```

**Solution:**
```bash
# Run initialization script
psql -d gympappa -f database/init.sql

# Verify tables created
psql -d gympappa -c "\dt"

# Should list: "public" | "user" | "table"
```

---

### Issue: Cannot Insert Data

**Error:**
```
ERROR: duplicate key value violates unique constraint
```

**Solutions:**

1. **User already exists**:
   ```bash
   psql -d gympappa
   SELECT * FROM "user" WHERE user_id = 'e22018';
   ```

2. **Clear test data**:
   ```bash
   # DELETE all data (careful!)
   DELETE FROM "user";
   DELETE FROM role_request;
   
   # Reset sequences
   ALTER SEQUENCE role_request_id_seq RESTART WITH 1;
   ```

---

### Issue: Password Hash Issues

**Symptoms:**
- Can't login after registering
- Passwords appear as plain text
- Login always fails

**Solutions:**

1. **Verify bcryptjs installed**:
   ```bash
   npm ls bcryptjs
   
   # If missing
   npm install bcryptjs
   ```

2. **Check hash function**:
   ```javascript
   // In backend/utils/passwordUtils.js
   import bcrypt from 'bcryptjs';
   
   // Make sure using async
   const hashedPassword = await bcrypt.hash(password, 10);
   ```

3. **Database password field**:
   ```bash
   psql -d gympappa
   SELECT user_id, password FROM "user";
   # Password should be long hash, not plain text
   ```

---

## 🔗 API Endpoint Issues

### Issue: Endpoint Returns 404

**Error:**
```
POST http://localhost:5000/api/auth/login 404 Not Found
```

**Solutions:**

1. **Verify route exists**:
   - Check `backend/routes/auth.js`
   - Route should be: `POST /login`
   - Full path: `/api/auth/login`

2. **Check route mounting**:
   ```javascript
   // In backend/index.js
   app.use('/api/auth', authRoutes);
   ```

3. **Check HTTP method**:
   - `GET` vs `POST` must match
   - Check frontend API call method
   - Check backend route definition

---

### Issue: 401 Unauthorized

**Error:**
```
401 Unauthorized - Access token required
```

**Solutions:**

1. **Token not in request**:
   - Check localStorage has token
   - `localStorage.getItem('token')`
   - Token must be on login

2. **Token in wrong format**:
   ```javascript
   // In api.js interceptor
   // Format must be: "Bearer <token>"
   config.headers.Authorization = `Bearer ${token}`;
   ```

3. **Endpoint requires auth**:
   - Protected routes need: `authenticateToken` middleware
   - Check backend route has middleware

---

### Issue: 403 Forbidden

**Error:**
```
403 Forbidden - Insufficient permissions
```

**Solutions:**

1. **User role not authorized**:
   - Check required role
   - Verify logged-in user's role
   - Check role in localStorage

2. **Role-based middleware issue**:
   ```javascript
   // In backend route
   router.get('/path', 
     authenticateToken, 
     authorizeRole(['admin', 'counter-staff']), 
     controller
   );
   ```

---

## 🔍 Debugging Tips

### 1. Enable Verbose Logging

**Backend**:
```javascript
// Add to routes
console.log('Request:', req.method, req.path);
console.log('Body:', req.body);
console.log('User:', req.user);
```

**Frontend**:
```javascript
// Add to API calls
console.log('API Call:', method, endpoint, data);
console.log('Response:', response.data);
console.log('Error:', error.response?.data);
```

### 2. Use Browser DevTools

**Console Tab**:
- Check for JavaScript errors
- View API responses
- Log variables

**Network Tab**:
- Check API request/response
- Verify status codes
- Check request headers

**Application Tab**:
- View localStorage for token
- Check cookies
- View indexed DB if used

### 3. Use Database Viewer

```bash
# Connect to database
psql -d gympappa

# View all users
SELECT * FROM "user";

# View specific user
SELECT * FROM "user" WHERE user_id = 'e22018';

# View all requests
SELECT * FROM role_request;

# Check table structure
\d "user"
```

### 4. Backend Logs

```bash
# Check for errors
tail -f backend.log

# Or in terminal where npm run dev is running
# Look for error messages and stack traces
```

---

## 📋 Debugging Checklist

Before asking for help:

- [ ] Restarted backend server
- [ ] Restarted frontend server
- [ ] Cleared browser cache (Ctrl+Shift+Del)
- [ ] Checked browser console (F12)
- [ ] Checked backend logs (terminal)
- [ ] Verified database is running
- [ ] Checked .env file values
- [ ] Verified all dependencies installed
- [ ] Tried hard refresh (Ctrl+Shift+R)
- [ ] Tested with fresh browser tab

---

## 🆘 Getting Help

**Step 1**: Check this guide
**Step 2**: Review relevant documentation
**Step 3**: Ask team members
**Step 4**: Post on chat with:
- Screen capture of error
- Steps to reproduce
- What you already tried
- Backend/frontend logs

---

## 📞 Quick Contacts

- **Documentation**: See README.md
- **API Help**: See API_DOCUMENTATION.md
- **Setup Help**: See SETUP_CHECKLIST.md
- **Code Help**: See DEVELOPMENT_GUIDELINES.md

---

**Remember**: Most issues have simple solutions. Take time to read error messages carefully!

Last Updated: March 2026
