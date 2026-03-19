# WhatsApp Web Clone

A full-stack WhatsApp Web clone built with React, Node.js, Express, MongoDB, and Socket.IO.
This project implements real-time messaging, user authentication, and group chat capabilities.

## Features
- **User Authentication**: Register and login securely using JWT and bcrypt.
- **Real-time Messaging**: Socket.IO enables instant messaging without page reloads.
- **Direct Messages & Group Chats**: Support for one-on-one and multi-user group conversations.
- **Message Readability**: Auto-scroll to latest messages, visual differentiation of sent/received messages.
- **Modern UI**: Styled with Tailwind CSS for a clean, responsive layout resembling WhatsApp Web.

## Prerequisites
- Node.js (v16+ recommended)
- MongoDB running locally or a MongoDB connection string (e.g., MongoDB Atlas)

## Getting Started

### 1. Database Setup
Ensure MongoDB is running locally on port 27017, or set the `MONGO_URI` environment variable.

### 2. Backend Setup (`/server`)

1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on the provided `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *Required variables: `MONGO_URI`, `JWT_SECRET`, `PORT`*
4. Run the server:
   ```bash
   npm run dev
   ```
   The backend should now be running on `http://localhost:5000`.

### 3. Frontend Setup (`/client`)

1. Navigate to the client folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *Required variables: `REACT_APP_API_URL`, `REACT_APP_SOCKET_URL`*
4. Run the frontend development server:
   ```bash
   npm run dev
   ```
   The React app should now be running on `http://localhost:5173`.

## Environment Variables

### Server (`server/.env.example`)
```env
MONGO_URI=mongodb://127.0.0.1:27017/whatsapp-clone
JWT_SECRET=supersecretkey
PORT=5000
```

### Client (`client/.env.example`)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## Project Structure
- `/client`: React frontend using Vite, Tailwind CSS, Axios, React Router.
- `/server`: Node.js Express backend with Mongoose and Socket.IO.
