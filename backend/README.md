# Cafe Management Backend API

FastAPI backend with MongoDB for authentication and user management.

## Setup

### Prerequisites
- Python 3.8+
- MongoDB (local or remote)

### Installation

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
- Windows: `venv\Scripts\activate`
- Linux/Mac: `source venv/bin/activate`

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the `backend` directory:
```
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=cafe_management
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Running the Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

API documentation (Swagger UI): `http://localhost:8000/docs`

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login and get access token
- `GET /api/auth/me` - Get current user information (requires authentication)

### Request/Response Examples

#### Sign Up
```json
POST /api/auth/signup
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer",
  "name": "John Doe",
  "cafe_id": null
}
```

#### Login
```json
POST /api/auth/login
{
  "username": "john_doe",
  "password": "password123"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "customer",
    "name": "John Doe",
    "cafe_id": null,
    "created_at": "2024-01-01T00:00:00",
    "is_active": true
  }
}
```

## User Roles

- `admin` - System Administrator
- `manager` - Café Owner/Manager (requires cafe_id)
- `barista` - Café Staff (requires cafe_id)
- `customer` - Café Customer (cafe_id is null)

## Security

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- CORS is configured for frontend integration

