# GympAPPa API Documentation

## 🔗 Authentication Endpoints

### Register User
**POST** `/api/auth/register`

Creates a new user account with university email.

**Request Body:**
```json
{
  "university_email": "e22018@eng.pdn.ac.lk",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "userId": "e22018",
    "email": "e22018@eng.pdn.ac.lk",
    "name": "John Doe",
    "role": "student"
  }
}
```

**Errors:**
- `400 Bad Request`: Invalid email format or user already exists
- `500 Internal Server Error`: Server error

---

### Login User
**POST** `/api/auth/login`

Authenticates user with credentials.

**Request Body:**
```json
{
  "userId": "e22018",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "userId": "e22018",
    "email": "e22018@eng.pdn.ac.lk",
    "name": "John Doe",
    "role": "student"
  }
}
```

**Errors:**
- `400 Bad Request`: Invalid credentials
- `500 Internal Server Error`: Server error

**Note:** User ID is case-insensitive on the backend

---

### Get User Profile
**GET** `/api/auth/profile`

Retrieves complete user profile with faculty and batch information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "user": {
    "userId": "e22018",
    "email": "e22018@eng.pdn.ac.lk",
    "name": "John Doe",
    "role": "student",
    "profilePicture": "data:image/jpeg;base64,...",
    "tel": "+94XXXXXXXXX",
    "personalEmail": "john@gmail.com",
    "district": "Kandy",
    "faculty": "Faculty of Engineering",
    "batch": "2022"
  }
}
```

**Errors:**
- `401 Unauthorized`: No token provided
- `403 Forbidden`: Invalid token
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

---

### Update User Profile
**PUT** `/api/auth/profile`

Updates user profile information.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "profilePicture": "data:image/jpeg;base64,...",
  "tel": "+94XXXXXXXXX",
  "personalEmail": "updated@gmail.com",
  "district": "Colombo"
}
```

**Fields (all optional):**
- `name`: Full name (any string)
- `profilePicture`: Base64 encoded image
- `tel`: Phone number
- `personalEmail`: Personal email address
- `district`: District name

**Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "userId": "e22018",
    "email": "e22018@eng.pdn.ac.lk",
    "name": "Updated Name",
    "role": "student",
    "profilePicture": "data:image/jpeg;base64,...",
    "tel": "+94XXXXXXXXX",
    "personalEmail": "updated@gmail.com",
    "district": "Colombo",
    "faculty": "Faculty of Engineering",
    "batch": "2022"
  }
}
```

**Errors:**
- `401 Unauthorized`: No token provided
- `403 Forbidden`: Invalid token
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

---

### Verify Firebase Token
**POST** `/api/auth/verify-firebase`

Verifies Firebase authentication token.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "firebaseToken": "firebase_id_token_from_client"
}
```

**Response (200 OK):**
```json
{
  "message": "Firebase token verified"
}
```

**Errors:**
- `401 Unauthorized`: Invalid token
- `403 Forbidden`: Firebase verification failed
- `500 Internal Server Error`: Server error

---

## 🔑 Authentication Details

### JWT Token Structure
```
Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "userId": "e22018",
  "role": "student",
  "iat": 1234567890,
  "exp": 1641321600
}

Signature: HMACSHA256(encode(header) + "." + encode(payload), secret)
```

### Token Usage
Include in request headers:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration
- **Default expiration**: 7 days
- **Refresh**: Re-login to get new token

---

## 📊 User Role Codes

```
student              - Regular student user
games-captain        - Captain of sports team
admin                - System administrator
counter-staff        - Equipment counter staff
psu                  - Peradeniya Student Union staff
faculty-cordinator   - Faculty coordinator
coach                - Sports coach
private-coach        - External/private coach
academic-staff       - Faculty academic staff
```

---

## 🎓 Faculty Codes and Batches

### Faculty Codes in User ID
```
A     - Arts (e.g., A22018 = Arts 2022 batch)
AHS   - Allied Health Sciences (e.g., AHS20001)
M     - Medicine (e.g., M20045)
E     - Engineering (e.g., E22018)
S     - Science (e.g., S21087)
MG    - Management (e.g., MG19102)
AG    - Agriculture (e.g., AG20056)
VS    - Veterinary & Animal Science (e.g., VS21023)
D     - Dental (e.g., D22034)
```

### Extracted Faculty Information
```
"Faculty of Arts"
"Faculty of Allied Health Sciences"
"Faculty of Medicine"
"Faculty of Engineering"
"Faculty of Science"
"Faculty of Management"
"Faculty of Agriculture"
"Faculty of Veterinary & Animal Science"
"Faculty of Dental"
```

### Batch Format
- Extracted from middle 2 digits of user ID
- Format: `20YY` where YY is from user ID
- Example: User ID `e22018` → Batch `2022`

---

## 🔒 Security Headers

All responses include security headers:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Access-Control-Allow-Origin: http://localhost:3000
```

---

## ⚠️ Error Responses

### Standard Error Format
```json
{
  "message": "Error description"
}
```

### HTTP Status Codes
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## 📝 Request/Response Examples

### Example: Complete Registration Flow

**1. Register**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "e22018@eng.pdn.ac.lk",
    "password": "MyPassword123",
    "name": "John Doe"
  }'
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "userId": "e22018",
    "email": "e22018@eng.pdn.ac.lk",
    "name": "John Doe",
    "role": "student"
  }
}
```

**2. Set Token**
```javascript
localStorage.setItem('token', response.data.token);
```

**3. Get Profile**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response:**
```json
{
  "user": {
    "userId": "e22018",
    "email": "e22018@eng.pdn.ac.lk",
    "name": "John Doe",
    "role": "student",
    "faculty": "Faculty of Engineering",
    "batch": "2022",
    "profilePicture": null,
    "tel": null,
    "personalEmail": null,
    "district": null
  }
}
```

---

## 🚀 Usage in Frontend

### React Example
```jsx
import { authAPI } from '../utils/api';

const LoginComponent = () => {
  const [credentials, setCredentials] = useState({});

  const handleLogin = async () => {
    try {
      const response = await authAPI.login(credentials);
      localStorage.setItem('token', response.data.token);
      // Redirect to dashboard
    } catch (error) {
      console.error('Login failed:', error.response.data.message);
    }
  };

  return (
    // JSX here
  );
};
```

---

## 🔌 Adding New Endpoints

### Backend: In `routes/auth.js`
```javascript
import express from 'express';
import { newController } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/new-endpoint', authenticateToken, newController);

export default router;
```

### Frontend: In `utils/api.js`
```javascript
export const authAPI = {
  newEndpoint: (data) => api.post('/auth/new-endpoint', data),
};
```

### Usage
```javascript
const response = await authAPI.newEndpoint(data);
```

---

## 📞 Support

For API issues:
1. Check the request format
2. Verify token in Authorization header
3. Check console for error messages
4. Verify user email format
5. Check backend logs

---

Last Updated: March 2026
