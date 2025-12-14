# Concierge Operations Platform — Feature List (Concise)

## Goal
A clean, ALICE-style concierge system focused strictly on **communication, arrivals, transport awareness, and daily concierge operations** — nothing more.

---

## 1. Main Concierge Dashboard (ALICE-Style)

- Timeline-based list of today’s items
- Color-coded by type and urgency
- Filters: Today / Date / Department / Status
- Search by guest name or room

### Timeline Items
- Guest requests
- Internal notes
- Arrival-related alerts
- Transport reminders

---

## 2. Ticket / Request System

### Ticket Types
- Guest request
- Internal request
- Reminder (wake-up call, transport)

### Ticket Fields
- Time
- Guest name
- Room number
- Short summary
- Status (Open / Pending / Confirmed / Closed)

### Actions
- Assign
- Transfer
- Add note
- Close

---

## 3. Guest Profiles (Minimal)

- Name
- Room number
- Contact details
- Notes (concierge-only)
- Arrival method (flight / train / car)

---

## 4. Arrival Tracking (Core Feature)

### Flights – Dublin Airport
- Flight number linked to guest
- Live arrival time
- Delay / cancellation status

### Arrival ETA to Hotel
- Auto-calculate ETA using:
  - Flight arrival time
  - Google Maps travel time
  - TomTom traffic conditions

### Alerts
- Guest delayed
- Late-night arrival
- High-risk delay

---

## 5. Traffic & Transport Awareness

### Road Traffic
- Live travel time from:
  - Dublin Airport → Hotel
- Congestion and incidents

### Trains & Public Transport
- Rail delays (DART / intercity)
- Bus disruptions

---

## 6. Concierge Communication

### Guest Communication
- Send message (SMS / WhatsApp / email)
- Pre-arrival message
- Delay notification

### Internal Notes
- Shift notes
- Concierge-only comments

---

## 7. Quick Links Panel

- Dublin Airport arrivals
- Traffic map
- Train status
- Bus status

---

## 8. What This Is NOT

- No housekeeping system
- No deep CRM
- No heavy reporting
- No guest-facing portal (for now)

---

## Outcome
A **simple, fast concierge tool** that shows:
- Who is arriving
- When they’ll actually get to the hotel
- What needs attention right now

Built clean. Built practical. Built for real concierge work.



---

# Frontend Development Task List (Cursor)

## Frontend Stack Assumptions
- React (or Next.js)
- Component-based UI
- Desktop-first (concierge desk)
- Clean, ALICE-style layout

---

## FE-1. App Shell & Layout

- Create base app layout
- Top navigation bar:
  - Dashboard
  - Tickets
  - Guests
  - Transport
- Main content area
- Persistent search + filter bar

---

## FE-2. Concierge Dashboard (Timeline View)

- Build vertical timeline component
- Time-ordered items
- Color-coded by type:
  - Ticket
  - Arrival alert
  - Transport alert
- Status indicators (open / delayed / urgent)
- Click item → open side detail panel

---

## FE-3. Filters & Search

- Filter timeline by:
  - Today / date
  - Status
- Search by:
  - Guest name
  - Room number
- Sticky filter/search bar

---

## FE-4. Ticket UI

- Ticket list view
- Create ticket modal
- Ticket detail panel:
  - Status dropdown
  - Notes input
  - Close action
- Inline status updates without page reload

---

## FE-5. Guest Profiles UI

- Guest list view
- Guest detail page:
  - Guest info
  - Arrival method
  - Linked flight/train
  - Notes section
- Show guest-related tickets and alerts

---

## FE-6. Arrival Tracking UI

### Flight Display
- Flight number input field
- Live arrival time display
- Delay / cancellation badge

### ETA Display
- Prominent hotel ETA label
- ETA update animation on change
- Warning state for late arrivals

---

## FE-7. Embedded Transport Panels (Live Data)

### Flights Panel
- Embedded live arrivals table
- Highlight guest-linked flights
- Auto-refresh indicator

### Traffic Panel
- Embedded route view (Airport → Hotel)
- Live travel time display
- Traffic delay warning state

### Rail Panel
- Live rail status list
- Delay badges

### Bus Panel
- Live disruption list

---

## FE-8. Alerts & Visual Flags

- Delayed arrival banner
- Late-night arrival highlight
- High-risk delay indicator
- Visual priority ordering in timeline

---

## FE-9. Concierge Communication UI

- Message compose modal
- Select guest
- Message type selector (SMS / WhatsApp / Email)
- Send + loading + success state
- Message history view per guest

---

## FE-10. State Management & Refresh

- Central state for:
  - Timeline items
  - Guests
  - Transport data
- Polling / refresh indicators
- Manual refresh button

---

## FE-11. Error & Empty States

- Loading skeletons
- API error banners
- Empty timeline state (no arrivals / tickets)

---

## FE-12. UX Polish

- Fast navigation (no full reloads)
- Keyboard-friendly actions
- Clear visual hierarchy
- Minimal animations only where useful

---

## Frontend Definition of Done

- Concierge can open app and immediately see today’s reality
- Timeline is readable within seconds
- Arrival ETA is obvious
- Delays are impossible to miss
- No external sites needed during a shift



---

# Backend Development Task List (Cursor)

## Backend Stack Assumptions
- Node.js (Express / Fastify) or equivalent
- REST API
- PostgreSQL or similar relational DB
- Server-side polling for external APIs
- JWT or session-based auth

---

## BE-1. Project Setup

- Initialize backend project
- Configure environment variables:
  - DB connection
  - Google Maps API key
  - TomTom API key
  - Flight data API key
  - Rail / bus API keys
- Basic server health endpoint

---

## BE-2. Authentication & Roles

- Staff login endpoint
- Issue auth token/session
- Role flags:
  - concierge
  - manager (read-only)
- Middleware to protect routes

---

## BE-3. Core Data Models

### Guest
- id
- name
- room_number
- contact_details
- arrival_method
- linked_flight
- notes
- created_at

### Ticket
- id
- type
- guest_id
- summary
- status
- created_at
- updated_at

### TicketNote
- id
- ticket_id
- user_id
- note
- created_at

---

## BE-4. Guest APIs

- Create guest
- Update guest
- Fetch guest list
- Fetch single guest + tickets

---

## BE-5. Ticket APIs

- Create ticket
- Update ticket status
- Add ticket note
- Close ticket
- Fetch tickets (filters: date, status, guest)

---

## BE-6. Arrival Tracking Engine

### Flight Tracking
- Store flight number per guest
- Poll flight API for status updates
- Detect delay / cancellation
- Persist latest arrival time

### ETA Calculation
- Fetch Google Maps travel time
- Fetch TomTom traffic data
- Calculate hotel ETA
- Recalculate on any upstream change

---

## BE-7. Transport Data Services

### Traffic Service
- Airport → hotel route endpoint
- Return:
  - travel_time
  - delay_vs_normal
  - incident_flag

### Rail Service
- Poll rail API
- Normalize delays into simple status

### Bus Service
- Poll bus disruption feed
- Normalize into active disruptions list

---

## BE-8. Timeline Aggregation API

- Merge:
  - tickets
  - arrival alerts
  - transport alerts
- Sort by urgency + time
- Single endpoint for frontend timeline

---

## BE-9. Alerts & Flags

- Generate alerts for:
  - delayed arrival
  - late-night arrival
  - high-risk delay
- Attach alerts to timeline

---

## BE-10. Communication APIs

- Send message endpoint
- Support:
  - SMS
  - WhatsApp
  - Email
- Log message to guest record

---

## BE-11. Polling & Caching

- Background jobs for:
  - flight status
  - traffic data
  - rail / bus data
- Cache responses to reduce API calls
- Configurable refresh intervals

---

## BE-12. Error Handling & Fallbacks

- Graceful handling of API downtime
- Return last known data if needed
- Log external API failures

---

## BE-13. Audit & Logging

- Log:
  - ticket status changes
  - ETA recalculations
  - messages sent
- Include timestamp + user

---

## BE-14. Security & Compliance

- Input validation
- Rate limiting
- Secure storage of API keys
- GDPR-aware data handling

---

## Backend Definition of Done

- Frontend receives clean, normalized data
- Arrival ETA is accurate and fast
- External APIs are abstracted away from frontend
- System survives partial API outages
- Concierge never needs to leave the app

