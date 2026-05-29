# Namma Taxi — Updated UI Project

This project UI has been redesigned in a modern taxi booking website style inspired by the provided reference images.

## UI pages changed
- Home page / landing page
- Login page
- Register page
- Booking page
- My Trips / booking cards
- User dashboard views
- Driver login and driver dashboard
- Admin dashboard, tables, forms, cards, sidebar and buttons
- Navbar, footer, status badges, spacing, radius and shadows

## Dark / Light mode
- A theme toggle button is available in the navbar and dashboard layouts.
- The selected theme is stored in `localStorage` using the key `nammaTaxiTheme`.
- Theme colors are controlled from `src/context/ThemeContext.jsx` and `src/utils/styles.js`.

## Responsive design
- Layouts use responsive grids and flexible cards.
- Navbar switches to mobile menu on small screens.
- Cards, forms and tables adapt for mobile, tablet and desktop screens.
- No backend or API flow was changed.

## Run frontend
```bash
npm install
npm run dev
```
Frontend will run on:
```bash
http://localhost:5173
```

## Run backend
```bash
pip install -r requirements.txt
python app_api.py
```
Backend will run on:
```bash
http://127.0.0.1:5000
```

## New packages installed
No new frontend packages were added. Existing React + Vite setup is used.

## Important
Only UI design and brand text were changed. Existing backend functionality, API endpoints, booking flow, driver/admin/user logic and live booking update flow were kept unchanged.
