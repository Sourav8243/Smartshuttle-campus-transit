# SmartShuttle – Final Submission Checklist

## 1. Case-study coverage

- [x] Student shuttle booking
- [x] Student trip history
- [x] Admin booking management
- [x] Driver management
- [x] Driver availability timeline
- [x] Driver duty scheduling and breaks
- [x] Route management
- [x] Driver-to-route assignment
- [x] Shuttle usage/demand analytics
- [x] Settings and local preferences

## 2. Functional QA to run locally

Run these commands from the project root:

```bash
npm install
npm run typecheck
npm run lint
npm run build
npm run dev
```

Then verify:

### Authentication
- [ ] Student demo login works
- [ ] Admin demo login works
- [ ] Logout works
- [ ] Protected routes redirect correctly
- [ ] Refresh preserves the demo session

### Student
- [ ] Dashboard loads
- [ ] Shuttle search works
- [ ] Invalid booking inputs are rejected
- [ ] Booking creation works
- [ ] Booking appears in My Bookings
- [ ] Booking cancellation works
- [ ] Cancelled seat is restored
- [ ] Trip History displays expected records

### Admin bookings
- [ ] Dashboard metrics load
- [ ] Booking search works
- [ ] Status/route/date filters work
- [ ] Pagination works
- [ ] Booking drawer opens
- [ ] Edit works
- [ ] Cancel works
- [ ] No-show works

### Drivers
- [ ] Driver list/search/filter works
- [ ] Add/edit/delete works
- [ ] Timeline displays schedules
- [ ] Duty schedule validation works
- [ ] Break validation works
- [ ] Overlapping schedules are rejected
- [ ] Driver assignment checks availability

### Routes
- [ ] Route list/search/filter works
- [ ] Add/edit/delete works
- [ ] Stop validation works
- [ ] Operating-hour validation works
- [ ] Driver assignment works
- [ ] Invalid assignments are rejected

### Analytics
- [ ] Date filters work
- [ ] Route filter works
- [ ] Demand by hour is displayed
- [ ] Route demand is displayed
- [ ] Booking status distribution is displayed
- [ ] Driver utilization is displayed
- [ ] Peak-hour insight is displayed

### Settings and UX
- [ ] Settings save to localStorage
- [ ] Settings survive refresh
- [ ] Toast feedback appears for important actions
- [ ] Empty states display correctly
- [ ] Forms have validation messages
- [ ] Mobile layout is usable
- [ ] Keyboard focus is visible

## 3. Demo accounts

### Student
- Email: `student@smartshuttle.com`
- Password: `student123`

### Admin
- Email: `admin@smartshuttle.com`
- Password: `admin123`

## 4. GitHub release checklist

- [ ] Push latest code to GitHub
- [ ] Confirm `README.md` is present
- [ ] Confirm no `node_modules` is committed
- [ ] Confirm no secrets/API keys are committed
- [ ] Confirm the repository builds from a clean checkout
- [ ] Add project screenshots
- [ ] Add deployed demo URL when available

## 5. Submission deliverables

The case study asks for a GitHub link and a demonstration video or screenshots. Prepare:

1. GitHub repository URL
2. Deployed application URL (if available)
3. 6–10 screenshots showing the major workflows
4. 2–4 minute demo video
5. README with setup and feature documentation

## 6. Suggested demo flow

1. Login as Student
2. Book a shuttle
3. Open My Bookings
4. Show booking details/history
5. Logout
6. Login as Admin
7. Show dashboard
8. Open Booking Management
9. Open a booking details drawer
10. Open Driver Management and timeline
11. Open Route Management
12. Show driver assignment
13. Open Analytics and demonstrate filters
14. Open Settings

## 7. Important limitation

This project uses mock authentication, mock application data and browser localStorage. It is a frontend case-study implementation, not a production transportation backend.
