Keep going # Concierge Operations Platform — Feature List (Concise)

## Goal

A clean, ALICE-style concierge system focused strictly on **communication, arrivals, transport awareness, and daily concierge operations** — nothing more.

---

## 1. Main Concierge Dashboard (ALICE-Style)

* Timeline-based list of today’s items
* Color-coded by type and urgency
* Filters: Today / Date / Department / Status
* Search by guest name or room

### Timeline Items

* Guest requests
* Internal notes
* Arrival-related alerts
* Transport reminders

---

## 2. Ticket / Request System

### Ticket Types

* Guest request
* Internal request
* Reminder (wake-up call, transport)

### Ticket Fields

* Time
* Guest name
* Room number
* Short summary
* Status (Open / Pending / Confirmed / Closed)

### Actions

* Assign
* Transfer
* Add note
* Close

---

## 3. Guest Profiles (Minimal)

* Name
* Room number
* Contact details
* Notes (concierge-only)
* Arrival method (flight / train / car)

---

## 4. Arrival Tracking (Core Feature)

### Flights – Dublin Airport

* Flight number linked to guest
* Live arrival time
* Delay / cancellation status

### Arrival ETA to Hotel

* Auto-calculate ETA using:

  * Flight arrival time
  * Google Maps travel time
  * TomTom traffic conditions

### Alerts

* Guest delayed
* Late-night arrival
* High-risk delay

---

## 5. Traffic & Transport Awareness

### Road Traffic

* Live travel time from:

  * Dublin Airport → Hotel
* Congestion and incidents

### Trains & Public Transport

* Rail delays (DART / intercity)
* Bus disruptions

---

## 6. Concierge Communication

### Guest Communication

* Send message (SMS / WhatsApp / email)
* Pre-arrival message
* Delay notification

### Internal Notes

* Shift notes
* Concierge-only comments

---

## 7. Quick Links Panel

* Dublin Airport arrivals
* Traffic map
* Train status
* Bus status

---

## 8. What This Is NOT

* No housekeeping system
* No deep CRM
* No heavy reporting
* No guest-facing portal (for now)

---

## Outcome

A **simple, fast concierge tool** that shows:

* Who is arriving
* When they’ll actually get to the hotel
* What needs attention right now

Built clean. Built practical. Built for real concierge work.

---

# Frontend Development Task List (Cursor)

## Frontend Stack Assumptions

* React (or Next.js)
* Component-based UI
* Desktop-first (concierge desk)
* Clean, ALICE-style layout

---

## FE-1. App Shell & Layout

* Create base app layout
* Top navigation bar:

  * Dashboard
  * Tickets
  * Guests
  * Transport
* Main content area
* Persistent search + filter bar

---

## FE-2. Concierge Dashboard (Timeline View)

* Build vertical timeline component
* Time-ordered items
* Color-coded by type:

  * Ticket
  * Arrival alert
  * Transport alert
* Status indicators (open / delayed / urgent)
* Click item → open side detail panel

---

## FE-3. Filters & Search

* Filter timeline by:

  * Today / date
  * Status
* Search by:

  * Guest name
  * Room number
* Sticky filter/search bar

---

## FE-4. Ticket UI

* Ticket list view
* Create ticket modal
* Ticket detail panel:

  * Status dropdown
  * Notes input
  * Close action
* Inline status updates without page reload

---

## FE-5. Guest Profiles UI

* Guest list view
* Guest detail page:

  * Guest info
  * Arrival method
  * Linked flight/train
  * Notes section
* Show guest-related tickets and alerts

---

## FE-6. Arrival Tracking UI

### Flight Display

* Flight number input field
* Live arrival time display
* Delay / cancellation badge

### ETA Display

* Prominent hotel ETA label
* ETA update animation on change
* Warning state for late arrivals

---

## FE-7. Embedded Transport Panels (Live Data)

### Flights Panel

* Embedded live arrivals table
* Highlight guest-linked flights
* Auto-refresh indicator

### Traffic Panel

* Embedded route view (Airport → Hotel)
* Live travel time display
* Traffic delay warning state

### Rail Panel

* Live rail status list
* Delay badges

### Bus Panel

* Live disruption list

---

## FE-8. Alerts & Visual Flags

* Delayed arrival banner
* Late-night arrival highlight
* High-risk delay indicator
* Visual priority ordering in timeline

---

## FE-9. Concierge Communication UI

* Message compose modal
* Select guest
* Message type selector (SMS / WhatsApp / Email)
* Send + loading + success state
* Message history view per guest

---

## FE-10. State Management & Refresh

* Central state for:

  * Timeline items
  * Guests
  * Transport data
* Polling / refresh indicators
* Manual refresh button

---

## FE-11. Error & Empty States

* Loading skeletons
* API error banners
* Empty timeline state (no arrivals / tickets)

---

## FE-12. UX Polish

* Fast navigation (no full reloads)
* Keyboard-friendly actions
* Clear visual hierarchy
* Minimal animations only where useful

---

## Frontend Definition of Done

* Concierge can open app and immediately see today’s reality
* Timeline is readable within seconds
* Arrival ETA is obvious
* Delays are impossible to miss
* No external sites needed during a shift
