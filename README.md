# Ayaana’s Luxury Radiance & Botanical Skincare

Dermatologist-formulated luxury botanical skincare web application built with React, Three.js, and Vite.

## Features
- 3D Interactive Product Jars (Three.js & WebGL)
- Luxury Glassmorphism & High-Performance UI
- Real Catalog Items & WhatsApp Ordering Integration
- Fully Responsive (Mobile, Tablet, Desktop)
- Fast Bundle Optimization (Gzip & Code Splitting)

## Getting Started
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Admin & database setup

1. In Supabase → SQL Editor, run the whole `supabase_schema.sql` file (safe to re-run).
2. In Supabase → Authentication → Users → **Add user**, create a login (email + password,
   tick "Auto Confirm User") for every email listed in the `admins` table.
3. Log in from the site's "Owner / Admin Login" button with that email and password.

Passwords are never stored in this repo or in the `admins` table. Only logged-in admins
can change products or see customer orders; customers track orders with Order ID + phone.
