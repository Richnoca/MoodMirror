# MoodMirror

MoodMirror is a fullstack mood journaling and social wellness web application. Users can create mood journal entries, upload images or videos with their posts, follow other users, view a social feed, like and comment on posts, and receive notifications when others interact with their content.

This project was built using React, Node.js, Express, MySQL/MariaDB, JWT authentication, and AWS EC2 deployment.

---

## Features

### User Authentication

- Register a new account
- Log in with email and password
- Passwords are hashed with bcrypt before being stored
- JWT tokens are used to authenticate protected API requests
- Users remain logged in through browser local storage

### Mood Journal

Users can create daily journal entries that include:

- Date
- Mood selection
- Tag/category
- Written note
- Optional image or video upload

Entries can be viewed later in the History page, where users can review, edit, and delete their own posts.

### Media Uploads

MoodMirror supports media uploads for journal entries.

Supported media types:

- JPG
- JPEG
- PNG
- GIF
- MP4
- MOV

The backend validates uploads and only allows approved image/video formats. Uploaded files are stored on the backend server and served through Express static file hosting.

Images are displayed using an image element, while videos are displayed with browser video controls.

### Social Features

MoodMirror includes a social networking system where users can interact with each other.

Users can:

- Discover other users
- Follow and unfollow users
- View who they follow
- View who follows them
- See posts from followed users in a Feed
- Like and unlike posts
- Comment on posts
- Receive notifications for social activity

### Likes

Users can like journal entries from other users. The backend tracks which user liked which post and prevents duplicate likes with a unique database constraint.

Users can also unlike posts, which removes their like from the database.

### Comments

Users can comment on journal entries in the Feed.

The comments system stores:

- The user who wrote the comment
- The entry being commented on
- The comment text
- The timestamp

Users can also delete their own comments.

### Notifications

MoodMirror includes notifications for social activity.

Users receive notifications when:

- Someone follows them
- Someone likes their post
- Someone comments on their post

The Notifications page allows users to:

- View notifications
- See unread notification count
- Mark one notification as read
- Mark all notifications as read

The navigation bar also shows the unread notification count.

### Admin Dashboard

MoodMirror includes admin-only functionality.

Admin users can:

- View all registered users
- See each user’s role
- See account creation dates
- See journal entry counts
- See most recent journal activity
- Promote regular users to admin
- Remove admin access from other users

Admin routes are protected on the backend, so regular users cannot access admin data even if they manually visit the Admin page or call the API.

---

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
- JWT authentication
- bcryptjs
- multer
- dotenv
- CORS

### Deployment

- AWS EC2
- MariaDB running on EC2
- Frontend served with serve
- Backend running with Node.js
- Static uploads served through Express

---

## Project Structure

MoodMirror/
- backend/
  - middleware/
    - authMiddleware.js
    - adminMiddleware.js
  - routes/
    - auth.js
    - entries.js
    - users.js
    - follows.js
    - likes.js
    - comments.js
    - feed.js
    - notifications.js
    - upload.js
  - uploads/
  - db.js
  - server.js
  - package.json
  - .env

- frontend/
  - src/
    - components/
      - Navbar.jsx
    - pages/
      - LoginPage.jsx
      - JournalPage.jsx
      - HistoryPage.jsx
      - PeoplePage.jsx
      - FeedPage.jsx
      - NotificationsPage.jsx
      - AdminPage.jsx
    - App.jsx
    - moodUtils.js
    - theme.js
  - package.json
  - vite.config.js

- README.md

---

## Database Design

MoodMirror uses a relational database with several connected tables.

### users

Stores user account information.

Main fields:

- id
- email
- password_hash
- is_admin
- created_at

### entries

Stores journal entries created by users.

Main fields:

- id
- user_id
- date
- mood
- note
- tag
- media_url
- media_type
- created_at

Each entry belongs to one user.

### follows

Stores follower/following relationships between users.

Main fields:

- id
- follower_id
- following_id
- created_at

This table allows users to follow many users and be followed by many users.

### likes

Stores which users liked which journal entries.

Main fields:

- id
- user_id
- entry_id
- created_at

A unique constraint prevents the same user from liking the same post more than once.

### comments

Stores comments on journal entries.

Main fields:

- id
- user_id
- entry_id
- comment_text
- created_at

### notifications

Stores social notifications for users.

Main fields:

- id
- recipient_id
- actor_id
- entry_id
- type
- message
- is_read
- created_at

Notification types include:

- follow
- like
- comment

---

## Backend API Routes

### Authentication

- POST /auth/register
- POST /auth/login

### Journal Entries

- GET /entries
- POST /entries
- PUT /entries/:id
- DELETE /entries/:id

These routes require a valid JWT token.

### Media Uploads

- POST /upload

Accepts an uploaded media file using form-data with the field name media.

The backend returns:

- message
- media_url
- media_type

Uploaded files are served from:

- /uploads

### User Discovery and Admin

- GET /users
- GET /users/discover
- PATCH /users/:id/admin

GET /users and PATCH /users/:id/admin are admin-only routes.

### Follows

- POST /follows/:userId
- DELETE /follows/:userId
- GET /follows/me/following
- GET /follows/me/followers
- GET /follows/:userId/following
- GET /follows/:userId/followers

### Feed

- GET /feed

Returns journal entries from users that the current user follows.

### Likes

- POST /likes/:entryId
- DELETE /likes/:entryId
- GET /likes/:entryId/count
- GET /likes/:entryId/status

### Comments

- POST /comments/:entryId
- GET /comments/:entryId
- DELETE /comments/:commentId

### Notifications

- GET /notifications
- GET /notifications/unread-count
- PATCH /notifications/:id/read
- PATCH /notifications/read-all

---

## Environment Variables

Create a .env file inside the backend folder.

Required values:

- DB_HOST=localhost
- DB_USER=mooduser
- DB_PASSWORD=your_database_password
- DB_NAME=moodmirror
- JWT_SECRET=your_jwt_secret
- PORT=3001

The .env file should not be committed to GitHub.

---

## Running the App Locally

### Backend

1. Go into the backend folder.
2. Install dependencies.
3. Start the server.

Commands:

- cd backend
- npm install
- node server.js

The backend runs on:

- http://localhost:3001

### Frontend

1. Go into the frontend folder.
2. Install dependencies.
3. Start the Vite dev server.

Commands:

- cd frontend
- npm install
- npm run dev

The frontend usually runs on:

- http://localhost:5173

---

## Running on AWS EC2

### Start Backend

Commands:

- cd /home/ec2-user/MoodMirror/backend
- node server.js

### Start Frontend

Commands:

- cd /home/ec2-user/MoodMirror/frontend
- npm run build
- npx serve -s dist -l 3000

The deployed app is accessed at:

- http://EC2_PUBLIC_IP:3000

The backend API runs at:

- http://EC2_PUBLIC_IP:3001

If the EC2 public IP changes, any hardcoded frontend API URLs must be updated and the frontend must be rebuilt.

---

## EC2 Security Group Rules

The EC2 instance needs inbound rules for:

- 22 for SSH
- 3000 for the frontend
- 3001 for the backend API

For testing, ports 3000 and 3001 can be open to 0.0.0.0/0.

---

## Security Notes

MoodMirror includes several security-focused features:

- Passwords are hashed with bcrypt
- JWT tokens protect private routes
- Admin routes are protected on the backend
- Users cannot access other users’ private entry management routes
- Uploads are validated by file type and file size
- Duplicate follows and likes are prevented with database constraints
- Foreign keys with ON DELETE CASCADE prevent broken relationships

Files that should not be committed:

- node_modules
- .env
- dist
- uploads
- .pem files

---

## Important Design Decisions

### Why use a separate follows table?

Following is a relationship between users. A separate table makes it easier to query followers and following, prevent duplicate follows, and clean up relationships if a user is deleted.

### Why use a separate likes table?

Likes are a many-to-many relationship. A user can like many entries, and one entry can be liked by many users.

### Why create notifications in the backend?

Notifications are created inside backend routes because the backend is where the real action is confirmed. For example, after a like is successfully saved, the backend creates a notification for the post owner.

### Why serve uploads statically?

Uploaded media files are stored on the backend and served through Express. This allows the frontend to display uploaded images and videos using a normal URL.

---

## Future Improvements

Possible improvements include:

- Move hardcoded API URLs into environment variables
- Add privacy controls for journal entries
- Add profile pages
- Add search for users
- Add image/video deletion from the uploads folder when posts are deleted
- Add pagination for the feed
- Add popularity-based feed sorting
- Add cloud file storage such as AWS S3
- Add password reset functionality
- Use PM2 or systemd to keep the backend running
- Use a custom domain or Elastic IP

---

## Author

Created by Cody Richnow as a fullstack web application project.
