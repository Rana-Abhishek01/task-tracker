# Task Tracker

A full-stack task management application built with React, Vite, Node.js, Express, Prisma, SQLite, and JWT authentication.

## Features

### Authentication
- User registration
- User login
- JWT authentication
- Protected dashboard
- Logout
- Client-side form validation
- API error handling

### Task Management
- Create tasks
- View tasks
- Edit tasks
- Delete tasks
- Mark tasks as completed/pending
- Task priority
- Task due dates
- Search tasks
- Filter tasks
- Sort tasks
- Overdue task detection
- Progress tracking
- Empty task state

### Admin
- Admin dashboard
- View all users
- View all tasks
- User/task management according to role

### UI
- Responsive design
- Mobile-friendly layout
- Dark mode
- Loading states
- Clean dashboard interface

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- React Router
- Axios
- CSS

### Backend
- Node.js
- Express.js
- Prisma ORM
- SQLite
- JWT
- bcryptjs
- Jest
- Supertest

## Project Structure

```text
TaskTracker/
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   ├── .env.example
│   └── package.json
│
├── src/
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── services/
│   │   └── api.js
│   ├── test/
│   │   ├── api/
│   │   └── components/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── .env.example
├── .gitignore
├── eslint.config.js
├── package.json
├── package-lock.json
├── README.md
└── vite.config.js