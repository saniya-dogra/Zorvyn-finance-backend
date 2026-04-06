# Finance Data Processing and Access Control Backend

## 🚀 Overview

This project is a backend system for a finance dashboard that supports role-based access control and financial data analytics.

## 🛠 Tech Stack

* Node.js
* Express.js
* MongoDB
* JWT Authentication

## ✨ Features

* User authentication (JWT)
* Role-based access control (Viewer, Analyst, Admin)
* Financial records CRUD
* Dashboard analytics (summary, category-wise, trends)

## 🔐 Roles & Permissions

| Role    | Permissions      |
| ------- | ---------------- |
| Viewer  | Read-only access |
| Analyst | Read + analytics |
| Admin   | Full access      |

## 📡 API Endpoints

### Auth

* POST /api/auth/login

### Users

* POST /api/users
* GET /api/users

### Records

* POST /api/records
* GET /api/records
* PUT /api/records/:id
* DELETE /api/records/:id

### Dashboard

* GET /api/dashboard/summary
* GET /api/dashboard/by-category
* GET /api/dashboard/monthly-trends
* GET /api/dashboard/recent

## ⚙️ Setup Instructions

```bash
npm install
npm run dev
```

## 📌 Assumptions

* Roles: viewer, analyst, admin
* JWT-based authentication
* MongoDB used for persistence
