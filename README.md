# SmartShuttle – Smart Campus Shuttle Management System

SmartShuttle is a university campus transportation management web application built with React, TypeScript, Vite and Tailwind CSS.

## Implemented

### Student
- Student dashboard
- Shuttle search and booking
- My bookings
- Booking cancellation
- Trip history
- localStorage persistence

### Admin
- Operations dashboard
- Booking management
- Booking search and filters
- Booking details drawer
- Booking edit/cancel/no-show actions
- Driver management
- Driver availability timeline
- Duty schedule management
- Start/end duty controls through schedule editing
- Break management and conflict validation
- Driver assignment to shuttles
- Assignment validation against duty coverage, breaks and overlapping assignments
- localStorage persistence for drivers and schedules

## Demo accounts

**Student**
- Email: `student@smartshuttle.com`
- Password: `student123`

**Admin**
- Email: `admin@smartshuttle.com`
- Password: `admin123`

## Run locally

```bash
npm install
npm run dev
```

## Type check

```bash
npm run typecheck
```

## Phase 4 data persistence

Driver records are stored under `smartshuttle_drivers` and driver schedules under `smartshuttle_driver_schedules` in browser localStorage. Existing booking and shuttle data continues to use the existing SmartShuttle booking service.

## Phase 7 – Production Polish
- Functional admin settings with local persistence
- Responsive toast notifications
- Improved keyboard focus and accessible controls
- Responsive application container and navigation refinements
- Dashboard preference controls and regional settings
