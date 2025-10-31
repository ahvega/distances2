# Enhanced Transportation Quotation System - Source Code Structure

This document outlines the organization and structure of the source code for the Enhanced Transportation Quotation System.

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # React components organized by feature
│   ├── Admin/             # Admin panel components
│   ├── Common/            # Shared/reusable components
│   ├── Costs/             # Cost display components
│   ├── Forms/             # Form-related components
│   ├── Layout/            # Layout and navigation components
│   ├── Map/               # Google Maps integration components
│   ├── Pricing/           # Pricing display components
│   ├── Quotation/         # Quotation form and results components
│   └── Vehicle/           # Vehicle selection and management components
├── config/                # Configuration files
├── context/               # React Context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Business logic and utilities
├── services/              # External API integrations and business services
├── types/                 # TypeScript type definitions
└── utils/                 # Helper functions and utilities
```

## Key Files and Their Purpose

### Types (`src/types/`)
- `index.ts` - Core data models and interfaces
- `services.ts` - Service interface definitions
- `utils.ts` - Utility types, constants, and validation schemas

### Services (`src/services/`)
- Service layer for business logic and external API integrations
- Each service handles a specific domain (routes, costs, vehicles, parameters)

### Utils (`src/utils/`)
- `unitConversion.ts` - Distance and fuel efficiency unit conversions
- `validation.ts` - Zod schemas for form and data validation
- `formatting.ts` - Display formatting utilities
- `storage.ts` - localStorage management utilities

### Config (`src/config/`)
- `environment.ts` - Environment variable configuration and validation

### Components (`src/components/`)
Each component directory contains:
- Component implementation files (`.tsx`)
- `index.ts` - Exports for the component group

### Hooks (`src/hooks/`)
- Custom React hooks for state management and side effects
- Each hook handles a specific domain or functionality

## Key Features Implemented

### 1. Enhanced Type System
- Comprehensive TypeScript interfaces for all data models
- Backward compatibility with existing legacy interfaces
- Strong typing for service interfaces and component props

### 2. Modular Architecture
- Clear separation of concerns between components, services, and utilities
- Organized component structure by feature domain
- Centralized configuration management

### 3. Validation and Data Integrity
- Zod schemas for runtime validation
- Type-safe form handling
- Input validation with proper error messages

### 4. Unit Conversion System
- Support for multiple distance units (km/miles)
- Multiple fuel efficiency units (mpg, mpl, kpl, kpg)
- Automatic conversion between units

### 5. Storage Management
- localStorage utilities for parameter persistence
- Parameter change history tracking
- Vehicle data management

### 6. Environment Configuration
- Secure Google API key management
- Environment-specific configuration
- Runtime validation of required environment variables

## Usage Guidelines

### Adding New Components
1. Create component in appropriate feature directory
2. Add to the directory's `index.ts` file
3. Follow TypeScript interface definitions from `src/types/`

### Adding New Services
1. Create service file in `src/services/`
2. Implement the corresponding interface from `src/types/services.ts`
3. Add export to `src/services/index.ts`

### Adding New Types
1. Add interfaces to appropriate file in `src/types/`
2. Update validation schemas in `src/utils/validation.ts` if needed
3. Consider backward compatibility with legacy interfaces

### Environment Setup
1. Copy `.env.example` to `.env`
2. Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` with valid Google Maps API key
3. Configure other environment variables as needed

## Next Steps

This structure provides the foundation for implementing the enhanced transportation quotation system. The next tasks will involve:

1. Implementing the service layer components
2. Creating the React components for the user interface
3. Integrating Google Maps APIs
4. Building the cost calculation engine
5. Implementing the quotation workflow

Each component is designed to be modular and testable, following React and Next.js best practices.