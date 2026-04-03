# Finance Dashboard Backend

A backend system for a finance dashboard built with Node.js, Express, and MongoDB.  
This project was built as part of the Zorvyn backend screening assignment.

---

## What This Does

This API lets different types of users interact with financial records based on their role.  
Think of it like a simple accounting system where:
- **Admins** have full control
- **Analysts** can view and add/edit records
- **Viewers** can only read data

---

## Tech Stack

- **Node.js** with **Express** — for the server and routing
- **MongoDB** with **Mongoose** — for the database
- **JWT** — for authentication (token based)
- **bcryptjs** — to hash passwords before storing

---

## Project Structure

```
finance-dashboard/
│
├── config/
│   └── db.js              # MongoDB connection
│
├── middleware/
│   └── authMiddleware.js  # JWT check + role check
│
├── models/
│   ├── User.js            # User schema (name, email, password, role)
│   └── Record.js          # Financial record schema
│
├── routes/
│   ├── authRoutes.js      # Register + Login
│   ├── userRoutes.js      # User management (admin only)
│   ├── recordRoutes.js    # CRUD for financial records
│   └── dashboardRoutes.js # Summary and analytics endpoints
│
├── server.js              # Main entry point
├── .env.example           # Example environment variables
└── package.json
```

---

## Setup Instructions

### 1. Clone the repo and install dependencies

```bash
npm install
```

### 2. Create a `.env` file

Copy `.env.example` to `.env` and fill in your values:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/finance_dashboard
JWT_SECRET=anysecretkeyhere
```

Make sure MongoDB is running on your machine (or use MongoDB Atlas and paste the connection string).

### 3. Start the server

```bash
# normal start
npm start

# or with auto-reload during development
npm run dev
```

Server will run on `http://localhost:5000`

---

## API Endpoints

### Auth

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login and get token | Public |

### Users

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/me` | Get your own profile | All |
| PUT | `/api/users/:id/role` | Change user role | Admin |
| PUT | `/api/users/:id/status` | Activate/deactivate user | Admin |

### Financial Records

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/records` | Get all records (supports filters) | All |
| GET | `/api/records/:id` | Get one record | All |
| POST | `/api/records` | Create new record | Admin, Analyst |
| PUT | `/api/records/:id` | Update a record | Admin, Analyst |
| DELETE | `/api/records/:id` | Delete a record | Admin only |

**Filter options for GET /api/records:**
- `?type=income` or `?type=expense`
- `?category=salary`
- `?startDate=2024-01-01&endDate=2024-12-31`

### Dashboard

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/dashboard/summary` | Total income, expenses, balance | All |
| GET | `/api/dashboard/by-category` | Breakdown by category | Admin, Analyst |
| GET | `/api/dashboard/monthly-trends` | Month-by-month trends | Admin, Analyst |
| GET | `/api/dashboard/recent` | Last 5 transactions | All |

---

## How Authentication Works

1. Register or login to get a JWT token
2. Add the token to all protected requests as a header:
   ```
   Authorization: Bearer <your_token_here>
   ```

---

## Role Permissions Summary

| Action | Viewer | Analyst | Admin |
|--------|--------|---------|-------|
| View records | ✅ | ✅ | ✅ |
| Create records | ❌ | ✅ | ✅ |
| Update records | ❌ | ✅ | ✅ |
| Delete records | ❌ | ❌ | ✅ |
| View summary | ✅ | ✅ | ✅ |
| View category/trends | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## Sample Request Bodies

**Register:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "analyst"
}
```

**Create Record:**
```json
{
  "amount": 5000,
  "type": "income",
  "category": "Salary",
  "date": "2024-06-01",
  "notes": "Monthly salary"
}
```

---

## Assumptions Made

- Any user can register with any role for testing purposes. In a real app, only admins would assign roles.
- Soft delete was not implemented to keep things simple — records are permanently deleted.
- No pagination added to keep the code clean, but it can be added easily with mongoose `.skip()` and `.limit()`.
- Dates are stored as MongoDB Date objects. Send dates in ISO format like `2024-06-01`.

---

## What Could Be Improved

- Add pagination to the records listing
- Add search by notes/description
- Add soft delete (isDeleted flag instead of actual delete)
- Add rate limiting to prevent abuse
- Write unit tests with Jest

---

*Built with Node.js + Express + MongoDB*
