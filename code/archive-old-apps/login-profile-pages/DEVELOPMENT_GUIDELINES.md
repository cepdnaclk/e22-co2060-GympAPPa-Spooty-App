# Development Guidelines for GympAPPa Team

## 🎯 Overview

This document provides guidelines for all team members working on the GympAPPa project. Follow these guidelines to maintain code consistency and ensure smooth collaboration.

## 📂 File Organization

### Backend Structure
```
backend/
├── controllers/     # Handles business logic
├── routes/         # API endpoint definitions
├── middleware/     # Authentication, validation
├── utils/          # Helper functions
├── index.js        # Main server entry
└── package.json
```

**When to use each folder:**
- **controllers/**: Complex business logic, database queries
- **routes/**: API endpoint definitions, route grouping
- **middleware/**: Authentication, request validation, error handling
- **utils/**: Reusable functions, formatting, calculations

### Frontend Structure
```
frontend/src/
├── pages/          # Full page components
├── components/     # Reusable components
├── styles/         # CSS files
├── utils/          # Helper functions
├── config/         # Configuration files (Firebase)
└── App.jsx         # Main app router
```

**When to use each folder:**
- **pages/**: Large components that fill entire screen
- **components/**: Reusable components used multiple times
- **styles/**: Separate CSS per component
- **utils/**: Helper functions, API calls, formatters

## 🎨 Styling Guidelines

### Color Usage
Always use CSS custom properties for colors:

```css
/* ✅ CORRECT */
.button {
  background-color: var(--color-green);
  color: white;
}

/* ❌ INCORRECT - Hard-coded colors */
.button {
  background-color: #44A194;
  color: white;
}
```

### Responsive Design
Use mobile-first approach with media queries:

```css
/* Base styles for mobile */
.container {
  grid-template-columns: 1fr;
  padding: 10px;
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    grid-template-columns: 1fr 1fr;
    padding: 20px;
  }
}

/* Desktop and up */
@media (min-width: 1200px) {
  .container {
    grid-template-columns: 1fr 1fr 1fr;
    padding: 40px;
  }
}
```

### Class Naming Convention
Use BEM (Block Element Modifier) naming:

```css
/* ✅ CORRECT */
.equipment-card { }
.equipment-card__title { }
.equipment-card__button { }
.equipment-card--featured { }

/* ❌ INCORRECT */
.card-title { }
.cardTitle { }
.title { }
```

## 🔄 Component Development

### React Component Structure

```jsx
import { useState, useEffect } from 'react';
import '../styles/component-name.css';

/**
 * ComponentName
 * 
 * Description of what this component does
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - The component title
 * @param {Function} props.onAction - Callback function
 */
const ComponentName = ({ title, onAction }) => {
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Side effects here
  }, []);

  const handleAction = () => {
    // Logic here
    onAction?.();
  };

  if (loading) return <div className="loading-spinner"></div>;

  return (
    <div className="component-name">
      <h2>{title}</h2>
      {error && <div className="error-message">{error}</div>}
      {/* Component JSX */}
    </div>
  );
};

export default ComponentName;
```

### Key Practices

1. **Always include prop documentation**
2. **Use meaningful state variable names**
3. **Handle loading and error states**
4. **Use event handlers prefixed with 'handle'**
5. **Separate logic from JSX**
6. **Extract complex JSX into sub-components**

## 🔐 API Integration

### Making API Calls

```javascript
// ✅ CORRECT - Using the centralized API utility
import { authAPI } from '../utils/api';

const handleLogin = async () => {
  try {
    setLoading(true);
    const response = await authAPI.login(credentials);
    localStorage.setItem('token', response.data.token);
  } catch (err) {
    setError(err.response?.data?.message || 'Request failed');
  } finally {
    setLoading(false);
  }
};

// ❌ INCORRECT - Direct axios calls scattered everywhere
import axios from 'axios';
axios.post('/api/auth/login', credentials);
```

### Adding New API Endpoints

1. **Add to utils/api.js**:
```javascript
export const equipmentAPI = {
  getAll: () => api.get('/equipment'),
  getById: (id) => api.get(`/equipment/${id}`),
  create: (data) => api.post('/equipment', data),
  update: (id, data) => api.put(`/equipment/${id}`, data),
  delete: (id) => api.delete(`/equipment/${id}`),
};
```

2. **Use in components**:
```javascript
import { equipmentAPI } from '../utils/api';

const response = await equipmentAPI.getAll();
```

## 🧪 Testing Your Component

Before committing:

1. **Test on mobile** (DevTools: Ctrl+Shift+K)
2. **Test on tablet** (Resize window to 768px)
3. **Test on desktop** (Normal view)
4. **Test error states** (Leave fields empty, use wrong data)
5. **Test loading states** (Slow network simulation in DevTools)
6. **Test all interactions** (Click buttons, fill forms)

## ✅ Code Review Checklist

Before submitting a pull request:

- [ ] Code follows naming conventions
- [ ] Component is responsive (mobile, tablet, desktop)
- [ ] Error handling included
- [ ] Loading states shown
- [ ] No console errors or warnings
- [ ] Prop documentation added
- [ ] Colors use CSS variables
- [ ] Consistent with existing code style
- [ ] No hard-coded values
- [ ] Tested with real data

## 📋 Git Workflow

### Branch Naming
```
feature/feature-name          # New feature
bugfix/bug-description        # Bug fix
styles/style-updates          # Style changes
refactor/component-name       # Code refactoring
```

### Commit Messages
```
# ✅ CORRECT
git commit -m "Add equipment request form component"
git commit -m "Fix profile picture upload bug"
git commit -m "Improve navigation responsive design"

# ❌ INCORRECT
git commit -m "stuff"
git commit -m "fixed"
git commit -m "update"
```

### Push and PR Process
```bash
# 1. Create feature branch
git checkout -b feature/your-feature

# 2. Make changes and commit
git add .
git commit -m "Descriptive commit message"

# 3. Push to remote
git push origin feature/your-feature

# 4. Create Pull Request on GitHub
# - Add description of changes
# - Reference related issues
# - Request reviewers
```

## 🚨 Common Mistakes to Avoid

### 1. Not Handling Error States
```javascript
// ❌ BAD
const [data, setData] = useState(null);
useEffect(() => {
  fetchData().then(setData);
}, []);

// ✅ GOOD
const [data, setData] = useState(null);
const [error, setError] = useState('');
useEffect(() => {
  fetchData()
    .then(setData)
    .catch(err => setError(err.message));
}, []);
```

### 2. Forgetting to Clean Up
```javascript
// ❌ BAD
useEffect(() => {
  window.addEventListener('resize', handleResize);
}, []);

// ✅ GOOD
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

### 3. Hard-coded Values
```javascript
// ❌ BAD
const data = fetchFrom('http://localhost:3000/api/equipment');

// ✅ GOOD
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const data = fetchFrom(`${API_URL}/equipment`);
```

### 4. Missing Loading State
```javascript
// ❌ BAD - No feedback while loading
<button onClick={handleSubmit}>Submit</button>

// ✅ GOOD - User sees loading feedback
<button onClick={handleSubmit} disabled={loading}>
  {loading ? 'Loading...' : 'Submit'}
</button>
```

## 📱 Mobile Optimization Tips

1. **Use touch-friendly sizes** (Min 44x44px for buttons)
2. **Hide non-essential on mobile** (Use display: none)
3. **Simplify on mobile** (One column instead of three)
4. **Font sizes** (Min 16px to prevent zoom on iOS)
5. **Spacing** (Adequate padding for touch targets)

## 🎯 Performance Tips

1. **Lazy load images**
```jsx
<img loading="lazy" src="..." alt="..." />
```

2. **Optimize lists**
```jsx
// Use key prop correctly
{items.map(item => (
  <ItemComponent key={item.id} {...item} />
))}
```

3. **Memoize expensive components**
```jsx
import { memo } from 'react';
const HeavyComponent = memo(({ data }) => {...});
```

## 📚 Resources for Team

- **React Concepts**: https://react.dev/learn
- **CSS Patterns**: https://web.dev/css/
- **Web Accessibility**: https://www.w3.org/WAI/WCAG21/quickref/
- **Git Best Practices**: https://git-scm.com/book

---

**Remember**: Consistency, clarity, and collaboration are key! 🚀
