# 🎵 SYSC Music

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=600&size=26&pause=1000&color=00F5D4&center=true&vCenter=true&width=700&lines=Animated+Full-Stack+Music+Streaming+App;React+%2B+Vite+%2B+Node.js+%2B+MongoDB;Google+OAuth+%7C+Playlist+Engine+%7C+Streaming+API" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Backend-Express%205-000000?style=for-the-badge&logo=express" />
  <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb" />
  <img src="https://img.shields.io/badge/Auth-Google%20OAuth-4285F4?style=for-the-badge&logo=google" />
  <img src="https://img.shields.io/badge/Deployed-Vercel%20%7C%20Render-black?style=for-the-badge" />
</p>

## 🚀 Live Deployment

- 🌐 Frontend: `https://sysc-music.vercel.app`
- 🔗 Backend API: `https://sysc-music.onrender.com/api`

## 📌 Overview

SYSC Music is a fully animated full-stack music streaming platform engineered with modern web architecture.

It combines:

- High-performance React UI
- Secure OAuth authentication
- Normalized streaming endpoints
- Playlist CRUD engine
- Hardened Express API
- Production-ready environment configuration

Designed with scalability, UX animation, and clean REST architecture in mind.

## ✨ Core Highlights

### 🎬 Fully Animated UI

- Intro transitions
- Page-level motion orchestration
- Overlay animations
- Player state transitions
- Auth screen motion flows
- Built with Framer Motion + GSAP

### 🔐 Authentication System

- Google OAuth
- Separate `/login` and `/register` flows
- Explicit HTTP status enforcement:
  - `409` -> Already registered
  - `404` -> Not registered
- Token-based session system

### 🎵 Streaming Engine

- Normalized media URLs
- Folder-based media listing
- Bulk media discovery endpoint
- Cold-start resilient backend (Render-aware)

### 📂 Playlist Engine

- Full CRUD support
- Track association endpoints
- RESTful structure
- Atomic update operations

### 🛡 Security Hardening

- `helmet`
- Controlled CORS origins
- Token validation
- Environment isolation

## 🧱 Tech Stack

### Frontend

- React 19
- Vite 7
- SCSS
- Framer Motion
- GSAP
- Axios

### Backend

- Node.js
- Express 5
- MongoDB + Mongoose
- dotenv
- cors
- helmet

## 🏗 Project Architecture

```text
sysc/
  src/                        # Frontend app
    components/
    hooks/
    services/
    styles/
  public/
  server/
    src/
      app.js
      server.js
      config/
      controllers/
      models/
      routes/
      services/
      seed/
    public/
```

## 🔐 Authentication Flow

### Frontend Routes

- `/login`
- `/register`

### Backend Endpoint

- `POST /api/auth/google`

### Request Body

```json
{
  "credential": "Google ID token",
  "mode": "login | register"
}
```

### Behavior Matrix

| Mode | Account Exists | Result |
| --- | --- | --- |
| register | Yes | 409 |
| login | No | 404 |
| success | - | Returns token + user object |

### Response Payload

```json
{
  "token": "...",
  "user": {
    "id": "",
    "name": "",
    "email": "",
    "avatarUrl": "",
    "authProvider": ""
  }
}
```

## 📡 API Overview

Base (Local): `http://localhost:5000/api`

### Tracks

- `GET /tracks`
- `GET /songs`

### Playlists

- `GET /playlists`
- `POST /playlists`
- `GET /playlists/:playlistId`
- `PATCH /playlists/:playlistId`
- `DELETE /playlists/:playlistId`

### Playlist Tracks

- `GET /playlists/:playlistId/tracks`
- `POST /playlists/:playlistId/tracks`
- `DELETE /playlists/:playlistId/tracks/:trackId`

### Media

- `GET /media/songs?folder=<folderName>`

### Authentication

- `POST /auth/google`

## ⚙ Environment Variables

### Backend (`server/.env`)

Required:

```env
MONGO_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

Common:

```env
PORT=5000
CORS_ORIGINS=http://localhost:5173,https://sysc-music.vercel.app
FRONTEND_URL=http://localhost:5173
```

Performance tuning:

```env
MONGO_MAX_POOL_SIZE=25
MONGO_MIN_POOL_SIZE=2
MONGO_SERVER_SELECTION_TIMEOUT_MS=10000
MONGO_SOCKET_TIMEOUT_MS=45000
MONGO_MAX_IDLE_TIME_MS=30000
TRACKS_CACHE_TTL_MS=30000
PLAYLISTS_CACHE_TTL_MS=30000
```

### Frontend (`.env.local`)

Required:

```env
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

Optional:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_DURATION_HYDRATION_ENABLED=false
VITE_DURATION_HYDRATION_LIMIT=12
VITE_DURATION_HYDRATION_CONCURRENCY=3
```

## 🧠 Google OAuth Setup

If you encounter:

- `403`
- `GSI_LOGGER: The given origin is not allowed`

Add these origins inside Google Cloud Console:

- `http://localhost:5173`
- `http://127.0.0.1:5173`
- `https://sysc-music.vercel.app`

Steps:

1. APIs & Services -> Credentials
2. Open OAuth 2.0 Client ID
3. Add Authorized JavaScript Origins
4. Save

Propagation may take a few minutes.

## 💻 Local Development

### 1) Install dependencies

```bash
npm install
cd server && npm install
```

### 2) Run backend

```bash
cd server
npm run dev
```

### 3) Run frontend

```bash
npm run dev
```

Open `http://localhost:5173`

## 📜 Available Scripts

### Root

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

### Server

- `npm run dev`
- `npm run start`
- `npm run seed`

## 📦 Production Notes

- Session stored in:
  - `localStorage -> sysc.auth.session.v1`
- Default API:
  - Dev -> `http://localhost:5000/api`
  - Prod -> `https://sysc-music.onrender.com/api`
- Render free tier may cold start after inactivity.

## 👨‍💻 Author

Vineet Dwivedi
