# API Integration Guide - Phone-Based Authentication

This document outlines all API endpoints and authentication flow implemented in the frontend.

## Base URL
```
http://localhost:8000/api
```
Update the `API_BASE_URL` in `src/context/AuthContext.jsx` if your backend runs on a different port/domain.

## Authentication Flow

### 1. Phone Number Login (Step 1)

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "phone": "9120000000"
}
```

**Response (Success - 200):**
```json
{
  "message": "SMS code sent successfully"
}
```

**Response (Error - 400/500):**
```json
{
  "message": "Error message here"
}
```

**Frontend Action:**
- User enters phone number and clicks "ارسال کد" (Send Code)
- If successful, UI advances to Step 2 for OTP verification

---

### 2. SMS Verification & JWT Retrieval (Step 2)

**Endpoint:** `POST /api/auth/verify-otp`

**Request:**
```json
{
  "phone": "9120000000",
  "code": "123456"
}
```

**Response (Success - 200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "isNewUser": false,
  "user": {
    "id": "user123",
    "phone": "9120000000",
    "firstName": "علی",
    "lastName": "احمدی",
    "role": "customer",
    "address": "تهران",
    "details": "..."
  }
}
```

**Response (Error - 401/400):**
```json
{
  "message": "Invalid or expired code"
}
```

**Frontend Action:**
- If `isNewUser` is `true`: Redirect to profile completion form
- If `isNewUser` is `false`: User is logged in, JWT stored in localStorage
- JWT is attached to all subsequent authenticated requests

---

### 3. Get User Profile

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Response (Success - 200):**
```json
{
  "id": "user123",
  "phone": "9120000000",
  "firstName": "علی",
  "lastName": "احمدی",
  "email": "ali@example.com",
  "role": "customer",
  "address": "تهران",
  "details": "...",
  "createdAt": "2024-12-06T10:30:00Z"
}
```

**Response (Unauthorized - 401):**
```json
{
  "message": "Invalid or expired token"
}
```

**Frontend Action:**
- Called on component mount to load current user profile
- If 401 returned: User is logged out and redirected to login
- Data displayed in UserProfile component

---

### 4. Update User Profile

**Endpoint:** `POST /api/auth/update`

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request:**
```json
{
  "firstName": "علی",
  "lastName": "احمدی",
  "phone": "9120000000",
  "address": "تهران",
  "details": "توضیحات اضافی"
}
```

**Response (Success - 200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "user123",
    "phone": "9120000000",
    "firstName": "علی",
    "lastName": "احمدی",
    "role": "customer",
    "address": "تهران",
    "details": "..."
  }
}
```

**Response (Error - 400/401):**
```json
{
  "message": "Error message"
}
```

**Frontend Action:**
- User submits profile form in UserProfile component
- Success message displayed for 3 seconds
- Local user state updated with new data

---

## JWT Token Management

### Storage
- JWT tokens are stored in `localStorage` with key: `authToken`
- Retrieved and attached automatically to authenticated requests

### Expiration Handling
- Any 401 response triggers:
  1. Clear stored JWT: `localStorage.removeItem('authToken')`
  2. Clear user data: `localStorage.removeItem('cafeUser')`
  3. Dispatch custom event: `authExpired`
  4. User redirected to login

### Usage in API Calls
```javascript
// Helper function in AuthContext
const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
};
```

---

## Frontend Integration Points

### 1. AuthContext (`src/context/AuthContext.jsx`)
- Manages JWT storage and retrieval
- Provides `setAuthToken()` to save tokens
- Provides `fetchUserProfile()` to load user data
- Handles token expiration (401 responses)

### 2. PhoneAuthDialog (`src/components/auth/PhoneAuthDialog.jsx`)
- **Step 1:** Calls `POST /api/auth/login` to send SMS
- **Step 2:** Calls `POST /api/auth/verify-otp` to verify code and get JWT
- Stores JWT in AuthContext
- Routes new users to profile completion

### 3. UserProfile (`src/components/profile/UserProfile.jsx`)
- **On Load:** Calls `GET /api/auth/me` to fetch current profile
- **On Submit:** Calls `POST /api/auth/update` to save changes
- Displays loading/error/success states
- Updates local auth context with new data

---

## Error Handling

All API calls include error handling:

```javascript
try {
  const response = await fetch(endpoint, options);
  const data = await response.json();
  
  if (!response.ok) {
    setError(data.message || 'Default error message');
    return;
  }
  
  // Success handling
} catch (err) {
  setError('Network error or server unavailable');
  console.error('Error:', err);
}
```

---

## Configuration

### Update Backend URL
Edit `src/context/AuthContext.jsx`:
```javascript
const API_BASE_URL = 'http://your-backend-url/api';
```

### SMS Code for Testing
- Default SMS code: `123456`
- This is temporarily hardcoded in backend
- In production, replace with actual SMS service (Twilio, etc.)

---

## Security Notes

1. **JWT Storage:** Currently uses localStorage (suitable for SPA)
   - For sensitive data, consider httpOnly cookies
   
2. **CORS:** Ensure backend allows requests from frontend origin

3. **HTTPS:** Use HTTPS in production to protect tokens in transit

4. **Token Refresh:** Consider implementing token refresh mechanism for long-lived sessions

5. **No Password Storage:** This system uses phone-only authentication, no passwords stored on frontend

---

## Testing Checklist

- [ ] Phone login (Step 1) sends code successfully
- [ ] OTP verification (Step 2) returns JWT
- [ ] JWT stored in localStorage
- [ ] Get user profile works with JWT
- [ ] Update profile saves data correctly
- [ ] 401 responses trigger logout
- [ ] Error messages display correctly
- [ ] Loading states show during API calls
- [ ] New users redirected to profile completion
- [ ] Existing users logged in directly
