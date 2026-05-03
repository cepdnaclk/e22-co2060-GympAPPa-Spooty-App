# 🗺️ GympAPPa Features Roadmap & Team Assignments

## 📊 Project Overview

**Session 1**: Authentication, Profile Management, Equipment Tracking System
**Team Size**: 4 members
**Timeline**: Current semester

---

## 👤 Team Member Assignments

### ✅ Akeela (YOU) - Authentication & Profile Management
**Status**: COMPLETED (This Session)

#### Completed:
- [x] User registration with university email validation
- [x] Traditional username/password login
- [x] Firebase Google OAuth integration
- [x] User profile page with edit functionality
- [x] Automatic faculty and batch extraction
- [x] Profile picture upload
- [x] Contact information management
- [x] Role-based navigation system
- [x] Response header and footer design
- [x] Template for teammates

#### Next (Future Session):
- [ ] Role change request system
- [ ] Email verification
- [ ] Password reset functionality

---

## 🎯 Remaining Session 1 Features

### 📦 Equipment Management (Team Member 1)
**Assigned to**: [Team Member 1 Name]
**Priority**: HIGH

#### Features to Implement:
- [ ] Equipment list/dashboard page
  - Display all available equipment
  - Filter by category/type
  - Search functionality
  - Real-time availability display
  
- [ ] Add Equipment page (Admin/Counter Staff only)
  - Form to add new equipment
  - Upload equipment picture
  - Set availability
  - Categories: Sports equipment, Uniforms, Other
  
- [ ] Update/Edit Equipment page
  - Modify equipment details
  - Update availability status
  - Change quantity
  
- [ ] Delete Equipment functionality
  - Confirmation dialog
  - Soft delete or hard delete
  - Audit trail

#### Database Tables Needed:
```sql
equipments (
  equipment_id SERIAL,
  name VARCHAR(255),
  category VARCHAR(100),
  quantity INT,
  available INT,
  description TEXT,
  picture TEXT,
  created_by VARCHAR(20),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

---

### 📋 Equipment Requests (Team Member 2)
**Assigned to**: [Team Member 2 Name]
**Priority**: HIGH

#### Features to Implement:
- [ ] Request Equipment page
  - Dashboard showing available equipment
  - Request form with date range
  - Quantity selection
  - Request status tracking
  - My requests history

- [ ] Accept/Review Requests (Counter Staff)
  - View pending requests
  - Accept or reject requests
  - Add comments/notes

- [ ] Request tracking
  - Real-time status updates
  - Notification system
  - Request history

#### Database Tables Needed:
```sql
equipment_requests (
  request_id SERIAL,
  user_id VARCHAR(20),
  equipment_id INT,
  quantity INT,
  start_date DATE,
  end_date DATE,
  status VARCHAR(20),
  reviewed_by VARCHAR(20),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

---

### 📤 Equipment Issue & Return (Team Member 3)
**Assigned to**: [Team Member 3 Name]
**Priority**: HIGH

#### Features to Implement:
- [ ] Issue Equipment page (Counter Staff only)
  - Select equipment
  - Select student
  - Record issue details
  - Generate issue slip
  - Auto-update availability

- [ ] Return Equipment page (Counter Staff)
  - Scan/enter issue ID
  - Record return
  - Condition check
  - Calculate fines if any
  - Auto-update availability

- [ ] My Issued Items page (All users)
  - View all items issued to me
  - Return date tracking
  - Status of items
  - Fine calculation

- [ ] Equipment Tracking System
  - In/out history
  - Current status of each item
  - Location tracking
  - Late returns handling

#### Database Tables Needed:
```sql
equipment_issues (
  issue_id SERIAL,
  equipment_id INT,
  user_id VARCHAR(20),
  issued_by VARCHAR(20),
  issue_date TIMESTAMP,
  due_date DATE,
  return_date TIMESTAMP,
  returned_by VARCHAR(20),
  status VARCHAR(20),
  condition VARCHAR(50),
  fine_amount DECIMAL,
  notes TEXT,
  created_at TIMESTAMP
)
```

---

## 📅 Implementation Timeline

### Week 1: Database & Backend API
- Team Member 1: Design equipment schema, create endpoints
- Team Member 2: Design request schema, create endpoints
- Team Member 3: Design issue/return schema, create endpoints

### Week 2: Frontend Pages
- Team Member 1: Equipment list, add, edit, delete pages
- Team Member 2: Request page, request tracking
- Team Member 3: Issue, return, and tracking pages

### Week 3: Integration & Testing
- Team Member 1: Integrate equipment with frontend
- Team Member 2: Integrate requests with frontend
- Team Member 3: Integrate issues/returns with frontend
- All: Test complete flow

### Week 4: Bug Fixes & Polish
- All: Test on mobile/tablet/desktop
- All: Fix bugs and improve UI
- All: Performance optimization

---

## 🔄 Workflow Integration Points

```
User Flow in Application:

1. LOGIN (Akeela - DONE) ✅
   ↓
2. DASHBOARD (Multiple Views per Role)
   ├─→ View Equipment Availability (Team 1)
   ├─→ Request Equipment (Team 2)
   ├─→ Issue/Return Equipment (Team 3 - Counter Staff Only)
   └─→ Profile Management (Akeela - DONE) ✅
```

---

## 🎨 Design Consistency

### For All Team Members:
1. **Use global colors**:
   - `var(--color-green)` - Primary
   - `var(--color-blue)` - Secondary
   - `var(--color-pink)` - Accent
   - `var(--color-light)` - Background

2. **Follow Layout Pattern**:
   - Header (with logo + profile)
   - Navigation (role-based)
   - Main Content
   - Footer

3. **Responsive Breakpoints**:
   - Mobile: < 480px
   - Tablet: 480px - 768px
   - Desktop: > 768px

4. **Use Template Component**:
   - Reference `pages/Template.jsx`
   - Follow card/table/form patterns

---

## 📚 API Endpoints to Create

### Equipment API (Team Member 1)
```
GET    /api/equipment                    # Get all equipment
GET    /api/equipment/:id                # Get single equipment
POST   /api/equipment                    # Add equipment
PUT    /api/equipment/:id                # Update equipment
DELETE /api/equipment/:id                # Delete equipment
```

### Request API (Team Member 2)
```
GET    /api/requests                     # Get all requests
GET    /api/requests/:id                 # Get single request
POST   /api/requests                     # Create request
PUT    /api/requests/:id                 # Update request status
DELETE /api/requests/:id                 # Cancel request
GET    /api/requests/my-requests         # Get user's requests
```

### Issue API (Team Member 3)
```
GET    /api/issues                       # Get all issues
GET    /api/issues/:id                   # Get single issue
POST   /api/issues                       # Create issue
PUT    /api/issues/:id/return            # Return equipment
GET    /api/issues/my-items              # Get user's issued items
GET    /api/issues/pending               # Get pending returns
```

---

## 🔑 Important Requirements

### Role-Based Access

| Feature | Student | Counter Staff | Admin | Games Captain | Others |
|---------|---------|---------------|-------|---|---|
| View Equipment | ✅ | ✅ | ✅ | ✅ | ✅ |
| Add Equipment | ❌ | ✅ | ✅ | ❌ | ❌ |
| Edit Equipment | ❌ | ✅ | ✅ | ❌ | ❌ |
| Delete Equipment | ❌ | ✅ | ✅ | ❌ | ❌ |
| Request Equipment | ✅ | ❌ | ✅ | ✅ | (varies) |
| Accept Requests | ❌ | ✅ | ✅ | ❌ | ❌ |
| Issue Equipment | ❌ | ✅ | ✅ | ❌ | ❌ |
| Return Equipment | ❌ | ✅ | ✅ | ❌ | ❌ |
| View My Items | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## ✨ Additional Features (Future)

### Session 2 (If time permits):
- [ ] Sports facilities booking system
- [ ] Maintenance tracking
- [ ] Budget management
- [ ] Reporting and analytics
- [ ] Email notifications
- [ ] Mobile app version

---

## 🚀 Deployment Checklist

Before going live:
- [ ] All features tested
- [ ] No console errors
- [ ] Responsive on all devices
- [ ] Performance optimized
- [ ] Security checked
- [ ] Database backed up
- [ ] Environment variables set
- [ ] Error handling complete
- [ ] User documentation written
- [ ] Team trained on system

---

## 📞 Escalation Points

If blocking issues arise:
1. First: Check TROUBLESHOOTING_GUIDE.md
2. Second: Ask team members
3. Third: Review code comments in similar features
4. Fourth: Contact TA/Professor

---

## 🎯 Success Metrics

By end of Session 1:
- [ ] All users can register and login
- [ ] Profile management works
- [ ] Equipment can be added/viewed/deleted
- [ ] Equipment can be requested
- [ ] Equipment can be issued and returned
- [ ] Real-time availability updates
- [ ] Role-based access works
- [ ] System works on mobile/tablet/desktop
- [ ] No critical bugs remain

---

**Let's build something amazing together! 🎉**

---

**Questions?** See:
- QUICK_START.md - Fast setup
- DEVELOPMENT_GUIDELINES.md - Coding standards
- API_DOCUMENTATION.md - API reference
- FILE_REFERENCE.md - File locations
