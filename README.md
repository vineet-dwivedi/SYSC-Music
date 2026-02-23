# SYSC - Full Stack Music Streaming App

SYSC is a full-stack music streaming project with a React + Vite frontend and a Node.js + Express + MongoDB backend.

It includes animated UI flows, music playback controls, search, local library management, and API-backed track delivery.

## Live URLs

- Frontend: `https://sysc-music.vercel.app`

## Features

### Frontend

- Animated intro and page transitions (Framer Motion)
- Multi-page app flow: Home, Library, Album, Artist, Playlist, Profile
- Mini player + expanded player
- Queue playback with next/previous, seek, and add-to-queue
- Search overlay for track discovery
- Keyboard volume controls (`ArrowUp`, `ArrowDown`, `+`, `-`)
- Album save/unsave and playlist creation/deletion in local storage
- Profile edit flow and toast notifications

### Backend API

- Track endpoints with normalized absolute media URLs
- Playlist CRUD endpoints and playlist-track mapping endpoints
- Media folder listing endpoint for bulk audio folders
- Static hosting for `/public` media assets
- Security and CORS middleware (`helmet`, `cors`)

## Tech Stack

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

## Project Structure

```text
sysc/
  src/                      # Frontend app source
  public/                   # Frontend static assets
  server/
    src/
      routes/               # API routes
      models/               # Mongoose models
      config/               # DB config
      seed/                 # Seed scripts/assets
    public/                 # Audio/images served by backend
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- MongoDB instance (local or Atlas)

### 1) Install dependencies

```bash
npm install
cd server && npm install
```

### 2) Configure environment variables

Create `server/.env`:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
CORS_ORIGINS=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

`MONGO_URI` is required. Other values are optional.

Optional frontend variable in root `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

If not set, frontend defaults to:
- `http://localhost:5000/api` in development
- `https://sysc-music.onrender.com/api` in production

### 3) Run the app locally

Run backend (terminal 1):

```bash
cd server
npm run dev
```

Run frontend (terminal 2, repo root):

```bash
npm run dev
```

Open `http://localhost:5173`.

## Scripts

### Root (frontend)

- `npm run dev` - Start Vite dev server
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### `server/` (backend)

- `npm run dev` - Start backend with nodemon
- `npm run start` - Start backend with Node.js
- `npm run seed` - Seed songs collection (update media paths as needed)

## API Overview

Base URL (local): `http://localhost:5000/api`

- `GET /tracks` (alias: `GET /songs`) - Fetch all tracks
- `GET /playlists` - Fetch playlists
- `POST /playlists` - Create playlist
- `GET /playlists/:playlistId` - Fetch playlist by ID
- `PATCH /playlists/:playlistId` - Update playlist metadata
- `DELETE /playlists/:playlistId` - Delete playlist
- `GET /playlists/:playlistId/tracks` - Fetch playlist tracks
- `POST /playlists/:playlistId/tracks` - Add track(s) to playlist
- `DELETE /playlists/:playlistId/tracks/:trackId` - Remove track from playlist
- `GET /media/songs?folder=bulk-800` - List audio files from a folder

## Notes

- The frontend currently consumes `GET /api/tracks` for playback data.
- Frontend playlist state is stored in local storage (`sysc.playlists.v1`) and is not yet wired to backend playlist APIs.

## Author

Vineet Dwivedi
