# Zen Tasks — Full Stack Todo Application

This project is a robust, full-stack task management system built to meet the "Major Project" guidelines. It features a modern, high-performance architecture with persistent storage and secure user authentication.

## 🚀 Features

- **User Authentication**: Secure Register/Login system using JWT (JSON Web Tokens) and password hashing with `bcryptjs`.
- **Persistent Database**: Serverless PostgreSQL database hosted on **Neon.tech** for reliable cloud-based persistence.
- **RESTful API**: Clean, structured endpoints for all CRUD operations.
- **Modern Frontend**: A beautiful dark glassmorphism UI built with Vanilla JS, HTML, and CSS.
- **Asynchronous UI**: Real-time updates using the `fetch` API without page refreshes.
- **Loading & Error Feedback**: Custom Toast notifications and loading spinners/indicators for smooth UX.
- **Advanced Filtering**: Server-side search and sort (Date ASC/DESC).
- **Security**: Sanitized inputs, XSS protection, and secure environment variable management.

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Neon.tech)
- **Security**: JWT, BcryptJS, CORS, Dotenv

## 📂 Project Structure

```bash
FullStackTodoApp/
├── backend/            # Express API & SQLite Database
│   ├── routes/         # API Route Handlers (Auth & Tasks)
│   ├── middleware/      # JWT Authentication Middleware
│   ├── db.js           # Database initialization & Schema
│   ├── server.js       # Main entry point & static file serving
│   ├── .env           # Environment variables (Port, Secrets)
│   └── package.json    # Backend dependencies
└── frontend/           # Client-side Application
    ├── index.html      # Main UI structure
    ├── style.css       # Premium glassmorphism styles
    └── script.js       # API integration & UI logic
```

## 🚥 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- NPM (comes with Node.js)

### Installation & Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file (one is already provided in this workspace) with:
   ```env
   PORT=3001
   JWT_SECRET=your_super_secret_key
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

5. **Visit the App**:
   Open your browser and navigate to:
   **http://localhost:3002**

## 📝 Learning Objectives Covered

- **CORS**: Configured permissions between frontend and backend.
- **HTTP Status Codes**: Proper usage of `201`, `200`, `401`, `404`, and `500`.
- **Database Relationships**: Mapping User IDs to Task records.
- **Security**: Implementation of input sanitization and secure auth flows.
