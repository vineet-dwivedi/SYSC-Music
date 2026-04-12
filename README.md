# SYSC Music (Full Stack Music Platform)

---

<h3 align="center">Tech Stack</h3>

<p align="center">
  <img src="https://skillicons.dev/icons?i=react,vite,express,mongodb,sass,google" />
</p>

<p align="center">
  <sub>
    React • Vite • Express • MongoDB • Google OAuth • SCSS
  </sub>
</p>

---

## 🚀 Live Deployment

| Platform | URL |
|----------|-----|
| **Frontend** | [https://sysc-music.vercel.app](https://sysc-music.vercel.app) |
| **Backend API** | [https://sysc-music.onrender.com/api](https://sysc-music.onrender.com/api) |

---

## 📌 Overview

**SYSC Music** is a production-ready, fully animated music streaming platform engineered with cutting-edge web technologies. Built with a focus on performance, user experience, and scalability, it delivers a seamless music discovery and playback experience.

### ✨ Key Features

- 🎬 **Fully Animated UI** - Smooth transitions with Framer Motion & GSAP
- 🔐 **Secure Authentication** - Google OAuth with token-based sessions
- 🎵 **Advanced Streaming** - Optimized media endpoints with folder-based discovery
- 📂 **Smart Playlists** - Full CRUD operations with track association
- 🛡️ **Security Hardened** - Helmet, CORS, token validation, environment isolation
- 💾 **Database Optimized** - MongoDB with Mongoose schemas
- ⚡ **High Performance** - Vite-powered frontend, Express backend

---

## Tech Stack

### Frontend Stack

<h3 align="center">Tech Stack</h3>

<table align="center">
  <tr>
    <td align="center">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="50" height="50" alt="React" />
      <br><b>React 19</b>
    </td>
    <td align="center">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" width="50" height="50" alt="Vite" />
      <br><b>Vite 7</b>
    </td>
    <td align="center">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg" width="50" height="50" alt="SCSS" />
      <br><b>SCSS</b>
    </td>
    <td align="center">
      <img src="https://cdn.simpleicons.org/framer" width="50" height="50" alt="Framer Motion" />
      <br><b>Framer Motion</b>
    </td>
  </tr>

  <tr>
    <td align="center">
      <img src="https://cdn.simpleicons.org/greensock" width="50" height="50" alt="GSAP" />
      <br><b>GSAP</b>
    </td>
    <td align="center">
      <img src="https://cdn.simpleicons.org/axios" width="50" height="50" alt="Axios" />
      <br><b>Axios</b>
    </td>
    <td align="center">
      <img src="https://cdn.simpleicons.org/lucide" width="50" height="50" alt="Lucide Icons" />
      <br><b>Lucide Icons</b>
    </td>
  </tr>
</table>

### 🔧 Backend Stack

<h3 align="center">Backend</h3>

<table align="center">
  <tr>
    <td align="center">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="50" height="50" alt="Node.js" />
      <br><b>Node.js</b>
    </td>
    <td align="center">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" width="50" height="50" alt="Express" />
      <br><b>Express 5</b>
    </td>
    <td align="center">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" width="50" height="50" alt="MongoDB" />
      <br><b>MongoDB</b>
    </td>
    <td align="center">
      <img src="https://cdn.simpleicons.org/mongoose" width="50" height="50" alt="Mongoose" />
      <br><b>Mongoose</b>
    </td>
  </tr>

  <tr>
    <td align="center">
      <img src="https://cdn.simpleicons.org/helmet" width="50" height="50" alt="Helmet" />
      <br><b>Helmet</b>
    </td>
    <td align="center">
  <img src="https://img.icons8.com/ios-filled/50/ffffff/api-settings.png" width="50" height="50" alt="CORS" />
  <br><b>CORS</b>
</td>

<td align="center">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="50" height="50" alt="Multer" />
  <br><b>Multer</b>
</td>

<td align="center">
  <img src="https://raw.githubusercontent.com/motdotla/dotenv/master/dotenv.svg" width="50" height="50" alt="Dotenv" />
  <br><b>Dotenv</b>
</td>
  </tr>
</table>

---

## ⚙️ Core Highlights

### 🎬 Advanced Animation System
- **Intro Screen Transitions** - Immersive entrance animations
- **Page-level Motion Orchestration** - Coordinated element animations across page transitions
- **Overlay Animations** - Smooth appearance/dismiss transitions for modals
- **Player State Transitions** - Dynamic UI updates during playback
- **Auth Screen Motion Flows** - Engaging authentication experience
- **Built with**: Framer Motion + GSAP for precision control

### 🔐 Authentication System
- **Google OAuth Integration** - Secure third-party authentication
- **Dual Flow Architecture**:
  - `/login` - For returning users
  - `/register` - For new users
- **Smart HTTP Status Codes**:
  - `409 Conflict` - User already registered
  - `404 Not Found` - User not registered
- **Token-Based Sessions** - Secure session management
- **Environment-Isolated Credentials** - Safe credential management

### 🎵 Streaming Engine
- **Normalized Media URLs** - Consistent URL structure for all media
- **Folder-Based Media Discovery** - Hierarchical media organization
- **Bulk Media Endpoints** - Efficient batch media retrieval
- **Cold-Start Resilience** - Optimized for serverless backend (Render-aware)
- **Optimized Streaming Performance** - Cached and efficient delivery

### 📂 Playlist Engine
- **Full CRUD Operations** - Create, read, update, delete playlists
- **Track Association Endpoints** - Add/remove songs from playlists
- **RESTful Architecture** - Clean, predictable API design
- **Atomic Updates** - Consistent database operations

### 🛡️ Security & Best Practices
- **Helmet.js Integration** - Secure HTTP headers
- **Controlled CORS Origins** - Restricted cross-origin access
- **Token Validation** - Verified user sessions
- **Environment Isolation** - Secure credential management
- **Input Validation** - Protected against injection attacks

---

## 📁 Project Structure

```
sysc/
├── 📄 index.html
├── 📄 package.json
├── 📄 vite.config.js
├── 📄 eslint.config.js
├── 📂 public/
│   └── 🖼️ static assets
├── 📂 src/ (Frontend)
│   ├── 📄 App.jsx
│   ├── 📄 main.jsx
│   ├── 📂 components/
│   │   ├── AppShell.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Topbar.jsx
│   │   ├── auth/
│   │   ├── pages/
│   │   ├── overlays/
│   │   └── player/
│   ├── 📂 hooks/
│   │   ├── useAppController.js
│   │   └── app/ (custom hooks)
│   ├── 📂 services/
│   │   ├── api.js
│   │   └── auth.js
│   └── 📂 styles/
│       ├── main.scss
│       ├── foundation/
│       └── components/
└── 📂 server/ (Backend)
    ├── 📄 package.json
    ├── 📂 src/
    │   ├── 📄 server.js
    │   ├── 📄 app.js
    │   ├── 📂 config/ (database)
    │   ├── 📂 controllers/ (auth, media, playlist, song)
    │   ├── 📂 models/ (User, Song, Playlist)
    │   ├── 📂 routes/ (auth, media, playlist, song)
    │   ├── 📂 services/ (cache, SMS)
    │   └── 📂 seed/ (database seeding)
    └── 📂 public/ (media assets)
        └── 🎵 songs/
```

---

---

## 🔐 Authentication Flow

### Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/login` | GET | User login page |
| `/register` | GET | User registration page |
| `/api/auth/google` | POST | Google OAuth authentication |

### Request Body

```json
{
  "credential": "Google ID token",
  "mode": "login | register"
}
```

### Response Behavior

| Mode | Account Status | HTTP Status | Response |
|------|---|---|---|
| `register` | Already exists | 409 | Error message |
| `login` | Does not exist | 404 | Error message |
| Either | Success | 200 | Token + User object |

### Response Payload (Success)

```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "avatarUrl": "https://...",
    "authProvider": "google"
  }
}
```

---

## 📡 API Documentation

**Base URL (Local):** `http://localhost:5000/api`  
**Base URL (Production):** `https://sysc-music.onrender.com/api`

### 🎵 Tracks Endpoints

| Endpoint | Method | Description |
|----------|--------|---|
| `/tracks` | GET | Get all tracks |
| `/songs` | GET | Get all songs |
| `/media/songs?folder=<folderName>` | GET | Get songs from specific folder |

### 📂 Playlists Endpoints

| Endpoint | Method | Description |
|----------|--------|---|
| `/playlists` | GET | Fetch user playlists |
| `/playlists` | POST | Create new playlist |
| `/playlists/:playlistId` | GET | Get playlist details |
| `/playlists/:playlistId` | PATCH | Update playlist |
| `/playlists/:playlistId` | DELETE | Delete playlist |

### 🎶 Playlist Tracks Endpoints

| Endpoint | Method | Description |
|----------|--------|---|
| `/playlists/:playlistId/tracks` | GET | Get playlist tracks |
| `/playlists/:playlistId/tracks` | POST | Add track to playlist |
| `/playlists/:playlistId/tracks/:trackId` | DELETE | Remove track from playlist |

---

## ⚙️ Environment Configuration

### Backend Configuration (`server/.env`)

**Required Variables:**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

**Common Variables:**
```env
PORT=5000
CORS_ORIGINS=http://localhost:5173,https://sysc-music.vercel.app
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**Performance Tuning:**
```env
# Database Connection Pool
MONGO_MAX_POOL_SIZE=25
MONGO_MIN_POOL_SIZE=2

# Timeouts (milliseconds)
MONGO_SERVER_SELECTION_TIMEOUT_MS=10000
MONGO_SOCKET_TIMEOUT_MS=45000
MONGO_MAX_IDLE_TIME_MS=30000

# Caching
TRACKS_CACHE_TTL_MS=30000
PLAYLISTS_CACHE_TTL_MS=30000
```

### Frontend Configuration (`.env.local`)

**Required Variables:**
```env
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

**Optional Variables:**
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_DURATION_HYDRATION_ENABLED=false
VITE_DURATION_HYDRATION_LIMIT=12
VITE_DURATION_HYDRATION_CONCURRENCY=3
```

---

## 🔧 Google OAuth Setup Guide

### Prerequisites
- Google Cloud Console project
- OAuth 2.0 Client ID created

### Common Issues & Solutions

**Error:** `403` / `GSI_LOGGER: The given origin is not allowed`

**Solution:** Add authorized origins in Google Cloud Console:

**Steps:**
1. Go to **Google Cloud Console** → **APIs & Services** → **Credentials**
2. Click on your **OAuth 2.0 Client ID**
3. Under **Authorized JavaScript origins**, add:
   ```
   http://localhost:5173
   http://127.0.0.1:5173
   https://sysc-music.vercel.app
   ```
4. Click **Save**
5. Changes may take 2-5 minutes to propagate

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- MongoDB connection URI
- Google OAuth credentials

### Installation & Setup

**Step 1: Clone and install dependencies**
```bash
git clone <repository>
cd sysc
npm install
cd server && npm install && cd ..
```

**Step 2: Configure environment variables**
```bash
# Backend
cd server && cp .env.example .env
# Edit .env with your credentials
```

```bash
# Frontend
cp .env.example .env.local
# Edit .env.local with your credentials
```

**Step 3: Start development servers**

Terminal 1 - Backend:
```bash
cd server
npm run dev
# Backend running on http://localhost:5000
```

Terminal 2 - Frontend:
```bash
npm run dev
# Frontend running on http://localhost:5173
```

**Step 4: Open in browser**
```
http://localhost:5173
```

---

## 📜 Available Scripts

### Frontend Scripts (`npm run <script>`)
| Script | Purpose |
|--------|---------|
| `dev` | Start Vite dev server on `localhost:5173` |
| `build` | Build production bundle |
| `preview` | Preview production build locally |
| `lint` | Run ESLint |

### Backend Scripts (`cd server && npm run <script>`)
| Script | Purpose |
|--------|---------|
| `dev` | Start Express server with nodemon on `localhost:5000` |
| `start` | Start Express server (production) |
| `seed` | Seed database with sample songs |

---

## 💾 Database Seeding

To populate the database with sample music data:

```bash
cd server
npm run seed
```

This will:
1. Connect to MongoDB
2. Clear existing songs (optional)
3. Import sample tracks from `src/seed/` directory
4. Generate album artwork from `src/seed/covers/`

---

## 📦 Deployment

### Frontend Deployment (Vercel)

```bash
# Deploy is automatic on push to main
# Or manually:
npm run build
# Upload 'dist/' folder to Vercel
```

**Live:** https://sysc-music.vercel.app

### Backend Deployment (Render)

```bash
# Create Render service
# Connect this repository
# Set environment variables in Render dashboard
```

**Live:** https://sysc-music.onrender.com

### Production Notes

- **Session Storage:** `localStorage` key: `sysc.auth.session.v1`
- **Cold Start:** Render free tier may have cold start after 15min inactivity
- **API Endpoints:** Automatically switch based on environment
- **Database Backups:** Configure in MongoDB Atlas dashboard

---

## 🎨 UI/UX Highlights

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark Theme** - Eye-friendly dark mode by default
- **Smooth Animations** - 60fps animations throughout
- **Accessibility** - WCAG 2.1 AA compliant
- **Performance** - LCP <2.5s, optimized images
- **Caching** - Service Worker enabled (optional)

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Cannot connect to MongoDB | Check `MONGO_URI` and network access in Atlas |
| `CORS` errors | Verify origins in `CORS_ORIGINS` env var |
| Blank page on frontend | Check dev tools console, verify API connection |
| Google OAuth fails | Check client ID, authorized origins, and error logs |
| Songs not loading | Run `npm run seed` in server directory |

---

## 📚 Documentation

- **[Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)**
- **[MongoDB Documentation](https://docs.mongodb.com/)**
- **[Express.js Guide](https://expressjs.com/)**
- **[React Documentation](https://react.dev/)**
- **[Vite Guide](https://vitejs.dev/)**

---

## 📄 License

ISC License - See LICENSE file for details

---

## 👨‍💻 Author

**Vineet Dwivedi**

GitHub: [@vineet-dwivedi](https://github.com/vineet-dwivedi)

---

## ⭐ Show Your Support

If you found this project helpful, please consider:
- ⭐ Starring this repository
- 🔗 Sharing with friends
- 💡 Contributing improvements
- 📝 Providing feedback

---

<p align="center">
  <strong>Made with ❤️ by Vineet Dwivedi</strong><br>
  <em>2026 © SYSC Music. All rights reserved.</em>
</p>
