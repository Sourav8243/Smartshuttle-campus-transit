<<<<<<< HEAD
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
=======
# Smartshuttle-campus-transit

# 🚌 SmartShuttle – Smart Campus Shuttle Management System

SmartShuttle is a modern web-based campus shuttle management system designed to simplify shuttle booking, driver scheduling, route management, and transportation analytics for students, staff, and administrators.

The system provides separate Student and Admin interfaces with a responsive and user-friendly dashboard.

---

## 🌐 Live Demo

🚀 **Live Application:**  
https://smartshuttle-campus-transit-7k9z9wjri-sourav-c3d1.vercel.app/login

📦 **GitHub Repository:**  
https://github.com/Sourav8243/smartshuttle-campus-transit

---

## 📌 Project Overview

Managing campus transportation manually can make shuttle booking, driver scheduling, route management, and demand monitoring difficult.

SmartShuttle provides a centralized platform where:

- Students can book campus shuttle rides.
- Students can view upcoming and previous bookings.
- Administrators can manage shuttle bookings.
- Administrators can manage drivers and their availability.
- Administrators can create and manage shuttle routes.
- Drivers can be assigned to routes and shuttle operations.
- Administrators can monitor shuttle demand and usage.
- Users can manage their profile and notification preferences.

This project was developed as a frontend-focused prototype using mock data and browser LocalStorage for persistence.

---

## ✨ Key Features

### 👨‍🎓 Student Module

- Student login
- Student dashboard
- Book a shuttle
- Select route
- Select pickup and drop-off points
- Select date and time
- View booking details
- View upcoming bookings
- Cancel bookings
- View trip history
- View driver and vehicle information
- Manage student profile

### 👨‍💼 Admin Module

- Admin login
- Admin dashboard
- Booking management
- Search and filter bookings
- View booking details
- Edit bookings
- Cancel bookings
- Mark bookings as no-show
- Driver management
- Driver availability timeline
- Duty scheduling
- Break scheduling
- Driver assignment
- Route management
- Pickup and drop-off point management
- Route status management
- Shuttle demand analytics
- Peak-hour analysis
- Route demand analysis
- Booking utilization
- Cancellation monitoring
- Admin settings
- Notification preferences

---

## 📊 Analytics

The Admin Analytics module provides insights into shuttle usage, including:

- Total bookings
- Peak demand periods
- Shuttle utilization
- Cancellation rate
- Route-wise demand
- Booking trends
- Date-based analytics

These analytics help administrators understand transportation demand and improve shuttle scheduling.

---

## 🚗 Driver Management

The Driver Management module allows administrators to:

- View drivers
- Add driver availability
- Schedule duty hours
- Add breaks
- Modify schedules
- Detect schedule conflicts
- Assign drivers to shuttle operations

A visual timeline is provided to make driver availability easier to understand.

---

## 🗺️ Route Management

Administrators can manage campus shuttle routes including:

- Route name
- Pickup points
- Drop-off points
- Distance
- Estimated duration
- Route status
- Assigned drivers

Routes can be created, updated, and managed from the Admin dashboard.

---

## 🔐 Demo Login Credentials

### Student

**Email**

student@smartshuttle.com


Password

student123


Admin

Email

admin@smartshuttle.com

Password

admin123

These are demo credentials for the frontend prototype.


🛠️ Technology Stack
Frontend
React
TypeScript
Vite
Tailwind CSS
React Router
Lucide React
Data & State
Mock data
Browser LocalStorage
Client-side state management
Development & Deployment
Git
GitHub
Visual Studio Code
Vercel
npm



👨‍💻 Author

Sourav Kumar

M.Tech – Artificial Intelligence & Machine Learning
B.Tech – Computer Science & Engineering

GitHub:
https://github.com/Sourav8243
>>>>>>> 5659604fc572f48fdc5ffb0a48e7a78db09dad67
