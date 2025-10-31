# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern web-based transportation quotation system (PlannerTours) for tour companies in Honduras, built with Next.js, TypeScript, Tailwind CSS, and DaisyUI. It calculates trip costs, generates quotes for different vehicle types, and displays routes using Google Maps integration.

## Architecture

### Tech Stack

- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS 3.4, DaisyUI 5.0
- **State Management**: React Context with useReducer
- **Maps**: Google Maps JavaScript API
- **Data**: Local JSON files with API fallback
- **Build Tool**: Next.js built-in bundler

### Project Structure

```nginx
src/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles and Tailwind imports
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Main application page
├── components/            # Reusable UI components
│   ├── Layout/           # Layout components (Mobile/Desktop)
│   ├── Forms/            # Form components
│   ├── Pricing/          # Pricing display components
│   ├── Map/              # Google Maps components
│   └── Costs/            # Cost breakdown components
├── context/              # React Context providers
│   └── AppContext.tsx    # Main application state
├── hooks/                # Custom React hooks
│   └── useGoogleMaps.ts  # Google Maps integration
├── lib/                  # Utility functions and business logic
│   ├── dataLoader.ts     # Data fetching and processing
│   └── costCalculation.ts # Cost calculation engine
└── types/                # TypeScript type definitions
    └── index.ts          # All application types

public/data/              # Static JSON data files
├── tipodevehiculo.json   # Vehicle specifications
├── parametro.json        # Operational parameters
├── tasaUSD.json         # Exchange rates
└── myData.json          # Additional parameters
```

### Key Features

**Responsive Design**:

- **Mobile**: Tab-based navigation with bottom navigation bar
- **Desktop**: Four-panel grid layout displaying all sections simultaneously
- Adaptive components that work seamlessly across screen sizes

**Data Management**:

- Local JSON files as primary data source
- API fallback for remote data fetching
- React Context for global state management
- Type-safe data handling with TypeScript

**Google Maps Integration**:

- Environment variable-based API key management
- Route calculation and visualization
- Distance Matrix API for multi-point calculations
- Dynamic map rendering with direction display

**Cost Calculation Engine**:

- Ported from legacy JavaScript with full feature parity
- Multiple pricing tiers (10%, 15%, 20%, 25%, 30% margins)
- Currency conversion (Lempiras/USD)
- Toll calculation based on route geography
- Travel expense calculation (hotels, meals, incentives)

## Development Workflow

### Environment Setup

1. Copy `.env.example` to `.env` and configure:

   ```bash
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start development server:

   ```bash
   npm run dev
   ```

### Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

### Data Management

- JSON files located in `public/data/`
- Data loaded via `src/lib/dataLoader.ts`
- State managed through `src/context/AppContext.tsx`
- Types defined in `src/types/index.ts`

### Component Architecture

- **Layouts**: `src/components/Layout/` - Responsive layout components
- **Forms**: `src/components/Forms/` - Data input components
- **Business Logic**: `src/lib/` - Calculation engines and utilities
- **Hooks**: `src/hooks/` - Custom React hooks for external integrations

### State Management

- Centralized state using React Context + useReducer
- Immutable state updates
- TypeScript-enforced state structure
- Automatic data loading on app initialization

## Key Functions and Components

### Cost Calculation (`src/lib/costCalculation.ts`)

- `VehicleCalculator` class - main cost calculation engine
- `calculateTollCosts()` - geographic toll calculation
- `calculateTravelExpenses()` - hotel, meals, incentive calculation
- `formatUnits()` - number formatting with currency symbols

### Google Maps Integration (`src/hooks/useGoogleMaps.ts`)

- `useGoogleMaps()` - loads Google Maps API
- `useRouteCalculation()` - calculates routes and distances
- Environment variable-based API key injection
- TypeScript-safe Google Maps API usage

### Data Loading (`src/lib/dataLoader.ts`)

- `loadVehicles()`, `loadParameters()` - data fetching with fallbacks
- `processParameters()`, `processVehicles()` - data transformation
- API availability checking with local fallback

### State Management (`src/context/AppContext.tsx`)

- `AppProvider` - main context provider
- `useAppContext()` - typed context hook
- Reducer-based state updates
- Automatic data initialization

## Testing and Validation

### Manual Testing

- Test responsive layout on mobile and desktop
- Verify Google Maps integration with different routes
- Validate cost calculations across vehicle types
- Check currency conversion accuracy
- Test form validation and user interactions

### Development Tools

- TypeScript for compile-time error checking
- ESLint for code quality
- Next.js development tools and hot reload
- Browser developer tools for debugging
- Console logging available in development mode

## Security and Configuration

### Environment Variables

- `GOOGLE_MAPS_API_KEY` - Required for maps functionality
- Never commit `.env` files to repository
- Use `.env.example` as template

### API Keys

- Google Maps API key stored securely in environment variables
- Client-side API key injection via Next.js configuration
- No sensitive data exposed in client bundle

## Deployment

### Build Process

```bash
npm run build
npm run start
```

### Production Considerations

- Static data files served from `public/data/`
- Google Maps API key must be configured in production environment
- Type checking and linting should pass before deployment
- Consider CDN for static assets

### Performance

- Next.js automatic code splitting
- Lazy loading of Google Maps API
- Optimized bundle size with tree shaking
- Responsive images and efficient CSS

## Legacy Migration Notes

The application maintains full feature parity with the original jQuery Mobile version while providing:

- Modern development experience with TypeScript
- Responsive design for mobile and desktop
- Improved maintainability and code organization
- Secure environment variable management
- Enhanced user experience with modern UI components

Legacy code preserved in `.old/` directory for reference.
