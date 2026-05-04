# MoodMirror

MoodMirror is a fullstack mood journaling web application that allows users to register, log in, track daily mood entries, and view their mood history. The app also includes administrative functionality so admin users can view all registered users, see basic activity statistics, and manage admin roles.

## Features

### User Features

- Register a new account
- Log in securely with email and password
- Create daily journal entries
- Select a mood
- Add notes and tags to entries
- View past journal entries in the history page
- Light mode and dark mode toggle

### Admin Features

- Admin-only dashboard
- View all registered users
- View each user's role
- View number of journal entries per user
- View each user's most recent journal entry date
- Promote regular users to admin
- Remove admin access from other admin users
- Backend-protected admin routes

## Tech Stack

### Frontend

- React
- Vite
- React Router
- JavaScript
- CSS-in-JS styling

### Backend

- Node.js
- Express.js
- MySQL / MariaDB
- JSON Web Tokens
- bcryptjs
- dotenv
- CORS

### Deployment

- AWS EC2
- MariaDB on EC2
- Frontend served with `serve`
- Backend running with Node.js

## Project Structure

```text
MoodMirror/
├── backend/
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── adminMiddleware.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── entries.js
│   │   └── users.js
│   ├── db.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── JournalPage.jsx
│   │   │   ├── HistoryPage.jsx
│   │   │   └── AdminPage.jsx
│   │   ├── App.jsx
│   │   └── theme.js
│   ├── package.json
│   └── vite.config.js
│
└── README.md
