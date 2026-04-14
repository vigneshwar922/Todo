# Zen Tasks — Full Stack Task Management

Zen Tasks is a premium, high-performance task management application built with a modern full-stack architecture. It features a stunning glassmorphism design, secure user authentication, and advanced task scheduling capabilities.

## 🚀 Key Features

- **User Authentication**: Secure Register/Login system using JWT (JSON Web Tokens) and password hashing with `bcryptjs`.
- **User Profiles**: Personalized user experience with profile modals and **profile picture uploads** (handled via `multer`).
- **Multi-Day Task Scheduling**: Dynamic task creation allowing users to schedule tasks across multiple days or specific date ranges.
- **Persistent Database**: Serverless PostgreSQL database hosted on **Neon.tech** for reliable cloud-based persistence.
- **Modern React Frontend**: A high-performance, responsive UI built with **React 19** and **Vite**, featuring smooth transitions and micro-animations.
- **Advanced Filtering & Search**: Server-side search and sorting (by date and creation) to handle large task lists efficiently.
- **Real-time UX**: Instant UI updates with custom Toast notifications and loading states.
- **Security**: Robust protection including input sanitization, JWT-based route protection, and secure environment management.

## 🛠️ Technology Stack

### Frontend
- **React 19** & **Vite** (for lightning-fast development and builds)
- **Lucide React** (for modern, consistent iconography)
- **CSS3 (Vanilla)** (custom glassmorphism design system)
- **Date-fns** (for efficient date manipulation)
- **Axios** (for streamlined API communication)

### Backend
- **Node.js** & **Express.js**
- **PostgreSQL** (via `pg` driver)
- **Multer** (for handling profile picture multipart/form-data)
- **JWT & BcryptJS** (for industry-standard security)
- **CORS & Dotenv**

## 📂 Project Structure

```bash
FullStackTodoApp/
├── client/             # React (Vite) Frontend
│   ├── src/
│   │   ├── api/        # Axios API client configurations
│   │   ├── components/ # Reusable UI components (Tasks, Auth, UI)
│   │   ├── context/    # Global state management (Auth, Toast)
│   │   └── styles/     # Premium CSS design system
│   └── public/         # Static assets
├── server/             # Node.js Express Backend
│   ├── routes/         # API endpoints (Auth, Tasks, Profile)
│   ├── middleware/      # JWT protection & Upload config
│   ├── uploads/        # Local storage for profile pictures
│   └── db.js           # PostgreSQL connection pool
└── legacy-frontend/    # Original Vanilla JS version (deprecated)
```

## 🚥 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- NPM (v9 or higher)

### 1. Backend Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure `.env`:
   Create a `.env` file with the following:
   ```env
   PORT=3001
   DATABASE_URL=your_neon_postgres_url
   JWT_SECRET=your_super_secret_key
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173` (default Vite port).

## 📝 Learning Objectives Covered

- **Full-Stack Integration**: Connecting a modern React SPA with a RESTful Express API.
- **Cloud Database Management**: Configuring and scaling with Neon PostgreSQL.
- **File System Handling**: Implementing secure image uploads and storage.
- **Complex UI Logic**: Managing bulk data entry and multi-day scheduling states.
- **Security Best Practices**: Role-based access (via JWT) and secure password storage.
