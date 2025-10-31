# Product Requirements Document (PRD)

## Project Title

Modern Transportation Quotation Web Application (PlannerTours)

## Overview

This document outlines the requirements for redeveloping the PlannerTours transportation quotation system as a modern web application using Next.js, Tailwind CSS, and DaisyUI. The new implementation will improve maintainability, security, and user experience while preserving the core business logic and data-driven approach of the original system.

## Goals

- Migrate the legacy jQuery Mobile SPA to a modern, maintainable stack.
- Enhance UI/UX with responsive design and modern components.
- Securely manage sensitive data (e.g., API keys) using environment variables.
- Store operational data (vehicles, parameters, rates) in local JSON files for easy updates.
- Maintain offline capability for static data and fallback logic.

## Tech Stack

- **Frontend:** Next.js (React), Tailwind CSS, DaisyUI
- **Data Storage:** Local JSON files (for vehicles, parameters, rates, etc.)
- **API Integration:** Google Maps JavaScript API (API key in `.env`)
- **State Management:** React Context or Redux (as needed)

## Functional Requirements

### 1. Application Structure

- **Single-page experience** with adaptive navigation for Datos, Precios, Mapa, Gastos.
- **Mobile:** Tabbed navigation for switching between sections.
- **Desktop:** All four sections (Datos, Precios, Mapa, Gastos) are displayed simultaneously as cards or panels on the same screen, making efficient use of available space.
- **Responsive design** for desktop and mobile.
- **Component-based architecture** for maintainability.

### 2. Data Management

- **Local JSON files** for:
  - Vehicle specifications (`tipodevehiculo.json`)
  - Operational parameters (`parametro.json`)
  - Currency exchange rates (`tasaUSD.json`)
  - Additional parameters (`myData.json`)
- **Currency exchange rates:**
  - Integrate with a free API service such as [exchangerate.host](https://exchangerate.host) for live rates if available.
  - If no free API is available, allow manual update of exchange rates via the admin interface.
- **Updatable data:**
  - All operational parameters, vehicle types/specs, and exchange rates must be updatable via an admin UI.
  - Admins can add new vehicle types and define their cost data.
  - Data changes are persisted to local JSON files or a suitable backend if available.
- **Data loading logic:**
  - Attempt to fetch from remote API (if available).
  - Fallback to local JSON files if offline or API fails.

### 3. Google Maps Integration

- **Route calculation and visualization** using Google Maps JavaScript API.
- **API key** stored in `.env` and injected at build/runtime.
- **Distance and duration** calculation for multi-point routes.
- **Automatic toll calculation** based on route geography and parameters.

### 4. Cost Calculation Engine

- **Vehicle cost calculation** based on:
  - Fuel efficiency
  - Daily costs
  - Tolls, hotels, and operational expenses
- **Multiple pricing tiers** (e.g., 10%, 15%, 20%, 25%, 30% profit margins)
- **Currency conversion** using latest exchange rates from JSON data.
- **Console logging** for debugging cost calculations (dev mode only).

### 5. UI/UX Features

- **Adaptive navigation layout:**
  - **Mobile:** Tabbed navigation for main sections (Datos, Precios, Mapa, Gastos).
  - **Desktop:** Four cards or panels (Datos, Precios, Mapa, Gastos) displayed side-by-side or in a grid on the same screen.
- **Form validation** to ensure required selections (e.g., vehicle type) before proceeding.
- **Dynamic pricing display** for selected vehicle and route.
- **Map display** with route and waypoints.
- **Offline support** for static data and basic calculations.

### 6. Security & Configuration

- **API keys** and sensitive config in `.env` (never committed to repo).
- **Environment variable loading** via Next.js conventions.
- **No sensitive data** in client-side code or public files.

## Non-Functional Requirements

- **Performance:** Fast load times, optimized bundle size.
- **Accessibility:** WCAG 2.1 AA compliance where possible.
- **Maintainability:** Modular code, clear separation of concerns.
- **Internationalization:** Support for Spanish (default) and future language expansion.

## Data Files (to be stored in `/data` or `/public/data`)

- `tipodevehiculo.json` — Vehicle types and specs
- `parametro.json` — Operational parameters
- `tasaUSD.json` — Exchange rates
- `myData.json` — Additional parameters

## .env Example

```bash
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## Future Enhancements

- Admin dashboard for managing JSON data via UI
- User authentication for admin features
- Automated tests (unit, integration, e2e)
- PWA support for enhanced offline experience

---

This PRD is intended as a blueprint for the modernized PlannerTours app. All features and flows from the legacy system should be preserved or improved, with a focus on maintainability, security, and user experience.
