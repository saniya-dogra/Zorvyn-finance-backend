# Finance Data Processing and Access Control Backend

A backend system for a finance dashboard built with Node.js, Express, and MongoDB.
Built as part of the Zorvyn Backend Developer Intern screening assignment.

---

## Tech Stack

- **Node.js** + **Express.js** — server and routing
- **MongoDB** + **Mongoose** — database and data modeling
- **JWT (jsonwebtoken)** — token based authentication
- **bcryptjs** — password hashing
- **Joi** — request validation

---

## Project Structure

```
Zorvyn-finance-backend/
│
├── config/
│   └── db.js                  # MongoDB connection setup
│
├── middleware/
│   └── authMiddleware.js      # JWT verification + role-based access control
│
├── models/
│   ├── User.js                # User schema (name, email, password, role, isActive)
│   └── Record.js              # Financial record schema with soft delete
│
├── routes/
│   ├── authRoutes.js          # Register + Login
│   ├── userRoutes.js          # User management (admin only)
│   ├── recordRoutes.js        # CRUD for financial records + pagination
│   └── dashboardRoutes.js     # Summary, trends, category breakdown
│
├── utils/
│   └── validation.js          # Joi validation schemas
│
├── server.js                  # App entry point
├── .env.example               # Environment variable template
└── README.md
```

---

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the root of the project and add the following:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_secret_key_here
```

You can use MongoDB Atlas (free tier) for the connection string. Replace `your_mongodb_connection_string_here` with your Atlas URI and make sure to replace `<password>` in the URI with your actual database user password.

### 3. Start the server

```bash
# development (with auto-reload)
npm run dev

# production
npm start
```

Server will run at: `http://localhost:5000`

---

## API Endpoints

### Auth

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login and receive JWT token | Public |

### Users

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/me` | Get current user profile | All |
| PUT | `/api/users/:id/role` | Update a user's role | Admin |
| PUT | `/api/users/:id/status` | Activate or deactivate a user | Admin |

### Financial Records

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/records` | Get all records with filters + pagination | All |
| GET | `/api/records/:id` | Get a single record | All |
| POST | `/api/records` | Create a new record | Admin, Analyst |
| PUT | `/api/records/:id` | Update a record | Admin, Analyst |
| DELETE | `/api/records/:id` | Soft delete a record | Admin |

**Filtering options for GET /api/records:**
- `?type=income` or `?type=expense`
- `?category=salary`
- `?startDate=2024-01-01&endDate=2024-12-31`
- `?page=1&limit=10`

### Dashboard

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/dashboard/summary` | Total income, expenses, net balance | All |
| GET | `/api/dashboard/by-category` | Totals grouped by category | Admin, Analyst |
| GET | `/api/dashboard/monthly-trends` | Month-by-month income vs expense | Admin, Analyst |
| GET | `/api/dashboard/recent` | Last 5 transactions | All |

---

## Authentication

After registering or logging in, you receive a JWT token. Pass it in the Authorization header for all protected routes:

```
Authorization: Bearer <your_token_here>
```

---

## Role Permissions

| Action | Viewer | Analyst | Admin |
|--------|--------|---------|-------|
| View records | ✅ | ✅ | ✅ |
| View summary | ✅ | ✅ | ✅ |
| View recent activity | ✅ | ✅ | ✅ |
| View category/trends | ❌ | ✅ | ✅ |
| Create records | ❌ | ✅ | ✅ |
| Update records | ❌ | ✅ | ✅ |
| Delete records | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## Sample Request Bodies

**Register:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "admin"
}
```

**Create a Financial Record:**
```json
{
  "amount": 5000,
  "type": "income",
  "category": "Salary",
  "date": "2024-06-01",
  "notes": "Monthly salary credit"
}
```

---

## Assumptions Made

- Any role can be assigned during registration for testing purposes. In a real production app, role assignment would be restricted to admins only.
- Soft delete is implemented for records — deleted records have `isDeleted: true` and are filtered out of all queries instead of being permanently removed from the database.
- Pagination defaults to page 1 with 10 records per page if not specified.
- Dates should be passed in ISO format such as `2024-06-01`.
- The JWT token expires after 7 days.

---

## What Could Be Improved Further

- Add rate limiting to prevent API abuse
- Add search by notes or description field
- Write unit tests using Jest
- Add Swagger or Postman collection for API documentation
- Add refresh token support for better session management