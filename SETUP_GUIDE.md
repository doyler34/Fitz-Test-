# Fitz Companion - Complete Setup Guide

This document provides complete instructions for setting up, running, and deploying the Fitz Companion hotel concierge platform. Use this guide when working on the project in a new environment or when onboarding new developers.

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Initial Setup](#initial-setup)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
6. [Running Locally](#running-locally)
7. [Deployment](#deployment)
8. [Git Workflow & Pushing Updates](#git-workflow--pushing-updates)
9. [Project Structure](#project-structure)
10. [Key Features](#key-features)
11. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Fitz Companion** is a modern hotel concierge operations platform built for hotel staff to manage guest requests, track arrivals, and handle internal operations.

### Tech Stack

- **Frontend**: React 18.3.1 (Vite) + React Router 6.28.0
- **Backend**: Express.js 4.21.1 (Vercel Serverless Functions)
- **Database**: Supabase (PostgreSQL)
- **Email Service**: Resend
- **Deployment**: Vercel
- **Icons**: Lucide React
- **Date Handling**: date-fns

### Project Statistics

- **Total Lines of Code**: ~9,547 lines
- **Total Keystrokes**: ~241,279 characters
- **Frontend Components**: 15+ React components
- **API Routes**: 7 main route files

---

## Prerequisites

Before starting, ensure you have:

- **Node.js** 18+ installed
- **npm** or **yarn** package manager
- **Git** installed
- **Supabase account** (free tier works)
- **Vercel account** (for deployment)
- **GitHub account** (for version control)

---

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/doyler34/Fitz-Test-.git
cd "fitz test"
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

### 3. Create Environment Files

Create the following `.env` files (see [Environment Variables](#environment-variables) section for details):

- `client/.env`
- `server/.env`

---

## Environment Variables

### Client Environment Variables (`client/.env`)

```env
# Local development
VITE_API_URL=http://localhost:3001

# Production (set in Vercel dashboard)
# VITE_API_URL=https://your-server.vercel.app
```

### Server Environment Variables (`server/.env`)

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here

# JWT Secret (minimum 32 characters)
JWT_SECRET=your_secure_jwt_secret_min_32_chars_long

# Email Service (Resend)
RESEND_API_KEY=re_your_resend_api_key
EMAIL_FROM=concierge@yourdomain.com

# Google Maps API (optional, for transport features)
GOOGLE_MAPS_API_KEY=your_google_maps_key

# Flight API (optional, for flight tracking)
FLIGHT_API_KEY=your_flight_api_key

# Hotel Coordinates (Dublin default)
HOTEL_COORDINATES=53.3498,-6.2603

# Server Port
PORT=3001
```

### Getting API Keys

1. **Supabase**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Navigate to Settings > API
   - Copy `Project URL` and `anon public` key

2. **Resend**:
   - Go to [resend.com](https://resend.com)
   - Create account and API key
   - Verify your domain for sending emails

3. **Google Maps** (optional):
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Enable Maps JavaScript API
   - Create API key

---

## Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization, name your project, set database password
4. Wait for project to be created

### 2. Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Open `server/src/db/schema.sql`
3. Copy the entire SQL content
4. Paste into SQL Editor
5. Click **Run** to execute

This will create:
- `staff` table (user accounts)
- `guests` table (guest information)
- `tickets` table (guest and internal requests)
- `ticket_notes` table (internal notes on tickets)
- `internal_notes` table (standalone internal notes)
- `messages` table (email communication logs)
- `flight_cache` table (cached flight data)
- `transport_cache` table (cached transport data)
- `audit_logs` table (system audit trail)

### 3. Verify Demo Data

The schema includes demo data. Verify it was inserted:
- Go to **Table Editor** in Supabase
- Check `staff`, `guests`, and `tickets` tables have data

### 4. Demo Login Credentials

After schema is loaded, you can login with:
- **Email**: `demo@thefitz.hotel`
- **Password**: `demo123`

---

## Running Locally

### Development Mode

Open **two terminal windows**:

#### Terminal 1 - Backend Server

```bash
cd server
npm run dev
```

Backend will run on `http://localhost:3001`

#### Terminal 2 - Frontend Client

```bash
cd client
npm run dev
```

Frontend will run on `http://localhost:3000`

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

### Build for Production

```bash
# Build frontend
cd client
npm run build

# Output will be in client/dist/
```

---

## Deployment

### Vercel Deployment

This project uses **Vercel** for hosting both frontend and backend.

### 1. Deploy Backend (Server)

```bash
cd server
vercel login
vercel
```

**Important Settings:**
- **Root Directory**: `server`
- **Build Command**: Leave empty (serverless functions don't need build)
- **Output Directory**: Leave empty

**Environment Variables** (set in Vercel dashboard):
- Copy all variables from `server/.env`
- Add them in Vercel project settings > Environment Variables

**Note**: After deployment, copy the server URL (e.g., `https://your-server.vercel.app`)

### 2. Deploy Frontend (Client)

```bash
cd client
vercel login
vercel
```

**Important Settings:**
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework Preset**: Vite

**Environment Variables** (set in Vercel dashboard):
- `VITE_API_URL` = Your backend Vercel URL (e.g., `https://your-server.vercel.app`)

### 3. Verify Deployment

1. Check backend: `https://your-server.vercel.app/api/health`
2. Check frontend: Visit your frontend Vercel URL
3. Test login with demo credentials

---

## Git Workflow & Pushing Updates

### Repository

- **GitHub**: https://github.com/doyler34/Fitz-Test-.git
- **Main Branch**: `main`

### Standard Workflow

```bash
# 1. Check current status
git status

# 2. Pull latest changes (if working with others)
git pull origin main

# 3. Stage your changes
git add .

# Or stage specific files:
git add client/src/pages/Dashboard.jsx
git add server/src/routes/timeline.js

# 4. Commit with descriptive message
git commit -m "Add notes edit functionality with pen icon"

# 5. Push to GitHub
git push origin main
```

### Commit Message Guidelines

Use clear, descriptive commit messages:

```bash
# Good examples:
git commit -m "Add notes button to dashboard"
git commit -m "Fix mobile responsive layout for tickets page"
git commit -m "Update open status color to blue across app"
git commit -m "Add auto-close timer for confirmed tickets"

# Avoid:
git commit -m "fix"
git commit -m "update"
git commit -m "changes"
```

### Branching (Optional)

For larger features, consider creating a branch:

```bash
# Create and switch to new branch
git checkout -b feature/notes-edit

# Make changes, commit
git add .
git commit -m "Add notes edit functionality"

# Push branch
git push origin feature/notes-edit

# Merge to main (via GitHub PR or locally)
git checkout main
git merge feature/notes-edit
git push origin main
```

### Handling Merge Conflicts

If you get conflicts when pulling:

```bash
# 1. Pull latest
git pull origin main

# 2. If conflicts occur, resolve them in your editor
# 3. Stage resolved files
git add .

# 4. Complete the merge
git commit -m "Resolve merge conflicts"

# 5. Push
git push origin main
```

### Authentication Issues

If you get authentication errors when pushing:

1. **Use Personal Access Token** (not password):
   - Go to GitHub Settings > Developer settings > Personal access tokens
   - Generate new token with `repo` permissions
   - Use token as password when pushing

2. **Or use GitHub CLI**:
   ```bash
   gh auth login
   ```

3. **Or configure credential helper**:
   ```bash
   git config --global credential.helper manager
   ```

---

## Project Structure

```
fitz test/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Layout.jsx           # Main layout wrapper
│   │   │   ├── NavBar.jsx           # Top navigation bar
│   │   │   ├── Sidebar.jsx          # Left sidebar
│   │   │   ├── TicketModal.jsx      # Create ticket modal
│   │   │   ├── TicketDetailPanel.jsx # Ticket detail side panel
│   │   │   ├── TimelineRow.jsx      # Timeline row component
│   │   │   ├── StatusBadge.jsx     # Status badge component
│   │   │   ├── NoteModal.jsx        # Add/edit note modal
│   │   │   ├── NotificationsPanel.jsx
│   │   │   └── SettingsPanel.jsx
│   │   ├── pages/                   # Page components
│   │   │   ├── Dashboard.jsx        # Main dashboard (timeline view)
│   │   │   ├── Tickets.jsx          # Tickets list page
│   │   │   ├── Guests.jsx           # Guests management
│   │   │   └── Transport.jsx       # Transport/flight tracking
│   │   ├── hooks/
│   │   │   └── useFilters.jsx      # Custom filter hook
│   │   ├── services/
│   │   │   └── api.js              # API client service
│   │   └── styles/
│   │       └── index.css           # Global styles
│   ├── package.json
│   ├── vercel.json                  # Vercel config
│   └── vite.config.js              # Vite config
│
├── server/                          # Express Backend
│   ├── api/
│   │   └── index.js                 # Vercel serverless entry
│   ├── src/
│   │   ├── routes/                  # API route handlers
│   │   │   ├── auth.js             # Authentication routes
│   │   │   ├── tickets.js          # Ticket CRUD operations
│   │   │   ├── timeline.js         # Timeline/notes endpoints
│   │   │   ├── guests.js           # Guest management
│   │   │   ├── messages.js         # Email sending
│   │   │   ├── transport.js        # Flight/traffic data
│   │   │   └── cron.js             # Scheduled tasks
│   │   ├── db/
│   │   │   ├── supabase.js         # Supabase client
│   │   │   └── schema.sql          # Database schema
│   │   └── index.js                # Express app setup
│   ├── package.json
│   └── vercel.json                 # Vercel serverless config
│
├── .gitignore
├── README.md
└── SETUP_GUIDE.md                  # This file
```

---

## Key Features

### 1. Dashboard (Timeline View)

- **Calendar-style timeline** showing tickets by hour
- **Color-coded rows** based on status and priority:
  - Red: Urgent/High priority
  - Blue: Open/In Progress
  - Green: Confirmed/Closed
  - Grey: Closed tickets (greyed out)
- **Mobile card view** for smaller screens
- **Filtering**: By date, status, department, type (Guest/Internal)
- **Notes section** at top showing internal notes
- **Add Note button** in filter bar

### 2. Ticket Management

- **Create tickets** (Guest requests or Internal requests)
- **Status workflow**: Open → In Progress → Confirmed → Closed
- **Auto-close timer**: Confirmed tickets auto-close after 5 minutes
- **Add internal notes** to tickets (no email sent)
- **Priority levels**: Low, Normal, High, Urgent

### 3. Notes System

- **Standalone notes** (not tied to tickets)
- **Add/Edit notes** via dashboard
- **Priority levels**: Low, Normal, High
- **Displayed on dashboard** above timeline

### 4. Tickets Page

- **Card-based layout** (mobile-friendly)
- **Tabs**: Guest Requests / Internal Requests
- **Status badges** with color coding
- **High-priority confirmed** tickets show crossed-out badge

### 5. Responsive Design

- **Mobile-first** approach
- **Full-screen modals** on mobile
- **Card layouts** replace tables on small screens
- **Touch-friendly** buttons and interactions

---

## Troubleshooting

### Common Issues

#### 1. "Failed to fetch" errors

**Problem**: Frontend can't connect to backend

**Solutions**:
- Check `VITE_API_URL` in `client/.env` matches backend URL
- Verify backend is running on correct port
- Check CORS settings in `server/src/index.js`
- For Vercel: Ensure `VITE_API_URL` points to deployed backend

#### 2. Supabase connection errors

**Problem**: "Failed to fetch Supabase" or database errors

**Solutions**:
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `server/.env`
- Check Supabase project is active (not paused)
- Verify database schema was run successfully
- Check Supabase dashboard for error logs

#### 3. Build errors on Vercel

**Problem**: Vercel build fails

**Solutions**:
- **Frontend**: Ensure "Root Directory" is set to `client` in Vercel
- **Backend**: Ensure "Root Directory" is set to `server` in Vercel
- Check build logs in Vercel dashboard
- Verify all environment variables are set in Vercel

#### 4. Authentication errors when pushing to Git

**Problem**: "Invalid username or token"

**Solutions**:
- Use Personal Access Token instead of password
- Configure credential helper: `git config --global credential.helper manager`
- Or use GitHub CLI: `gh auth login`

#### 5. Module not found errors

**Problem**: "Cannot find module" errors

**Solutions**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 6. Port already in use

**Problem**: "Port 3000/3001 already in use"

**Solutions**:
```bash
# Find process using port (Windows)
netstat -ano | findstr :3001

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change port in .env file
```

### Getting Help

1. Check this guide first
2. Review error messages in browser console (F12)
3. Check server logs in terminal
4. Review Vercel deployment logs
5. Check Supabase logs in dashboard

---

## Quick Reference Commands

### Development

```bash
# Start backend
cd server && npm run dev

# Start frontend
cd client && npm run dev

# Build frontend
cd client && npm run build
```

### Git

```bash
# Check status
git status

# Pull latest
git pull origin main

# Stage all changes
git add .

# Commit
git commit -m "Your message"

# Push
git push origin main
```

### Deployment

```bash
# Deploy backend
cd server && vercel

# Deploy frontend
cd client && vercel

# Update environment variables in Vercel dashboard
```

---

## Important Notes

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Always set environment variables in Vercel** after deployment
3. **Database schema must be run** before first use
4. **Backend URL must be set** in frontend `VITE_API_URL`
5. **Use Personal Access Token** for Git authentication (not password)

---

## Next Steps After Setup

1. ✅ Run database schema in Supabase
2. ✅ Set up environment variables
3. ✅ Install dependencies
4. ✅ Start development servers
5. ✅ Test login with demo credentials
6. ✅ Deploy to Vercel
7. ✅ Update frontend `VITE_API_URL` to production backend URL
8. ✅ Test production deployment

---

**Last Updated**: December 2024
**Project**: Fitz Companion Hotel Concierge Platform
**Repository**: https://github.com/doyler34/Fitz-Test-.git

