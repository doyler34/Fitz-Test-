# Fitz Hotel Concierge Platform

A modern, ALICE-style concierge operations platform for hotel staff.

## Features

- **Timeline Dashboard** - Real-time view of all tickets, arrivals, and alerts
- **Ticket Management** - Create, track, and close guest requests
- **Guest Profiles** - Store guest info with arrival details
- **Flight Tracking** - Live Dublin Airport arrival tracking
- **Traffic & Transport** - Real-time ETA calculations
- **Email Communication** - Send emails to guests directly

## Tech Stack

- **Frontend**: React (Vite) + React Router
- **Backend**: Express.js (Vercel Serverless)
- **Database**: Supabase (PostgreSQL)
- **Email**: Resend
- **Deployment**: Vercel

## Setup

### 1. Database Setup (Supabase)

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `server/src/db/schema.sql`
3. Copy your project URL and anon key from Settings > API

### 2. Environment Variables

Create `.env` files:

**server/.env**
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret_min_32_chars
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=concierge@yourdomain.com
GOOGLE_MAPS_API_KEY=your_google_maps_key
FLIGHT_API_KEY=your_flight_api_key
HOTEL_COORDINATES=53.3498,-6.2603
PORT=3001
```

**client/.env**
```
VITE_API_URL=http://localhost:3001
```

### 3. Install Dependencies

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 4. Run Development

```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm run dev
```

Open http://localhost:3000

### 5. Demo Login

- Email: `demo@thefitz.hotel`
- Password: `demo123`

## Deployment (Vercel)

### Frontend

```bash
cd client
vercel
```

### Backend

```bash
cd server
vercel
```

Set environment variables in Vercel dashboard for both projects.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Staff login |
| GET | /api/guests | List guests |
| POST | /api/guests | Create guest |
| GET | /api/tickets | List tickets |
| POST | /api/tickets | Create ticket |
| GET | /api/timeline | Get dashboard timeline |
| POST | /api/messages/send | Send email to guest |
| GET | /api/transport/flights | Get flight data |
| GET | /api/transport/traffic | Get traffic data |

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API client
│   │   └── styles/         # Global CSS
│   └── vercel.json
├── server/                 # Express backend
│   ├── api/
│   │   └── index.js        # Vercel entry
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── db/             # Database client
│   └── vercel.json
└── README.md
```

