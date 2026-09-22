# SmartShuttle – Smart Campus Shuttle Management System

SmartShuttle is a responsive university campus transportation management web application. It supports student shuttle booking and trip history together with admin operations for bookings, drivers, schedules, routes, driver assignment and demand analytics.

## Case-study coverage

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
- Booking search, filters and pagination
- Booking details drawer
- Booking edit/cancel/no-show actions
- Driver management
- Driver availability timeline
- Duty schedule management
- Break management and conflict validation
- Driver assignment
- Route management
- Route/driver assignment validation
- Shuttle demand and utilization analytics
- Peak-hour insight
- Settings and local preferences

## Technology

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React
- Browser localStorage for demo persistence

## Demo accounts

### Student
- Email: `student@smartshuttle.com`
- Password: `student123`

### Admin
- Email: `admin@smartshuttle.com`
- Password: `admin123`

## Run locally

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run typecheck
npm run lint
npm run build
```

## Project structure

```text
src/
├── components/
│   ├── common/
│   ├── layout/
│   └── ui/
├── context/
├── data/
├── hooks/
├── pages/
│   ├── admin/
│   ├── auth/
│   └── student/
├── services/
├── types/
└── utils/
```

## Data and persistence

The current implementation is designed for a frontend case study. Authentication and operational data are mocked and persisted in browser localStorage where appropriate. No real credentials or production transportation backend are used.

## Complexity analysis

See [COMPLEXITY_ANALYSIS.md](./COMPLEXITY_ANALYSIS.md) for the current frontend algorithm/data-handling analysis.

## Final QA checklist

See [FINAL_SUBMISSION_CHECKLIST.md](./FINAL_SUBMISSION_CHECKLIST.md) for the complete test and submission checklist.

## Submission

The case study requires the finished solution to be submitted through GitHub and demonstrated using a video or screenshots. Add the final repository URL, deployed URL (if used), screenshots and demo video before submission.

## Future improvements

- Real authentication and authorization
- Backend API and database
- Real-time shuttle/vehicle tracking
- Maps and GPS integration
- Push/email notifications
- Server-side analytics
- Audit logs
- Production-grade role and permission management

## Author

SmartShuttle – University Frontend Case Study
