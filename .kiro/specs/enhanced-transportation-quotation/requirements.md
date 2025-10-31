# Requirements Document

## Introduction

This document outlines the requirements for enhancing the existing transportation quotation system to provide comprehensive cost calculations, route planning, and pricing management for transportation services. The system will integrate Google Distance API and Google Maps API to calculate accurate routes, distances, and travel times, while providing detailed cost breakdowns and pricing options with configurable profit margins.

## Glossary

- **Transportation_System**: The web application that calculates quotations for transportation services
- **Vehicle_Pool**: The collection of available vehicles with different capacities and specifications
- **Route_Calculator**: The component that uses Google APIs to calculate distances, times, and display routes
- **Cost_Engine**: The calculation engine that determines fuel costs, driver expenses, and total trip costs
- **Pricing_Module**: The component that applies markup percentages to generate sale prices
- **Parameter_Manager**: The system component that manages configurable values like fuel prices and exchange rates
- **Quotation_Form**: The user interface where users input origin, destination, and base location
- **Distance_API**: Google Distance Matrix API for calculating travel distances and times
- **Maps_API**: Google Maps API for displaying routes and locations
- **Base_Location**: The location where the vehicle is stationed/stored
- **Markup_Percentage**: The profit margin applied to costs (10%, 15%, 20%, 25%, 30%)
- **Exchange_Rate_Manager**: Component that handles currency conversion between USD and local currency
- **Fuel_Calculator**: Component that calculates fuel consumption and refueling needs
- **Driver_Expense_Calculator**: Component that calculates per-diem expenses for drivers

## Requirements

### Requirement 1

**User Story:** As a transportation service provider, I want to input trip details through a quotation form, so that I can generate accurate cost estimates for my services.

#### Acceptance Criteria

1. WHEN a user accesses the quotation form, THE Transportation_System SHALL display input fields for origin, destination, and base location
2. THE Transportation_System SHALL provide an input field for group size with validation for positive integer values
3. WHEN a user enters location information, THE Transportation_System SHALL validate the locations using Google Places API
4. WHEN a user submits the form with valid locations, THE Transportation_System SHALL calculate the route using Distance_API
5. THE Transportation_System SHALL provide an input field for extra mileage at destination with validation for non-negative numeric values
6. WHEN route calculation is complete, THE Transportation_System SHALL display the calculated route on an interactive map using Maps_API

### Requirement 2

**User Story:** As a fleet manager, I want to maintain a comprehensive vehicle database, so that I can accurately calculate costs based on vehicle specifications.

#### Acceptance Criteria

1. THE Transportation_System SHALL store vehicle information including make, model, year, and fuel capacity
2. THE Transportation_System SHALL store configurable fuel mileage units (miles/gallon, miles/liter, km/liter, km/gallon)
3. THE Transportation_System SHALL store vehicle cost per distance unit (km or mile) and cost per day
4. THE Transportation_System SHALL store vehicle passenger capacity (maximum number of passengers)
5. WHEN vehicle data is updated, THE Transportation_System SHALL recalculate all dependent cost calculations

### Requirement 3

**User Story:** As a cost analyst, I want the system to calculate detailed fuel costs, so that I can provide accurate quotations including refueling expenses.

#### Acceptance Criteria

1. WHEN calculating fuel costs, THE Fuel_Calculator SHALL determine total fuel consumption based on vehicle mileage and trip distance
2. IF the trip distance exceeds vehicle autonomy, THEN THE Fuel_Calculator SHALL estimate additional refueling expenses en-route
3. THE Transportation_System SHALL maintain current diesel fuel prices with timestamp tracking in a parameters table
4. THE Transportation_System SHALL calculate fuel costs using the most recent stored fuel price and vehicle consumption rate
5. WHEN trip distance exceeds single tank range, THE Transportation_System SHALL include refueling stop costs in the total calculation

### Requirement 4

**User Story:** As a trip coordinator, I want the system to calculate driver expenses, so that I can include all operational costs in my quotations.

#### Acceptance Criteria

1. THE Driver_Expense_Calculator SHALL calculate per-diem food expenses considering 3 meals per day
2. THE Transportation_System SHALL store meal costs per day in a configurable parameters table
3. IF the trip duration exceeds one day, THEN THE Driver_Expense_Calculator SHALL include hotel lodging costs
4. THE Transportation_System SHALL store hotel costs per night in a configurable parameters table
5. THE Transportation_System SHALL calculate total driver expenses based on trip duration in days

### Requirement 5

**User Story:** As a sales manager, I want to see pricing options with different markup percentages, so that I can choose appropriate profit margins for different clients.

#### Acceptance Criteria

1. THE Pricing_Module SHALL calculate sale prices with markup percentages of 10%, 15%, 20%, 25%, and 30%
2. THE Transportation_System SHALL highlight the 15% markup as the recommended option
3. THE Transportation_System SHALL display all pricing options in a clear comparison table
4. THE Transportation_System SHALL show both cost and sale price for each markup level
5. THE Transportation_System SHALL calculate prices in both USD and local currency (HNL)

### Requirement 6

**User Story:** As a financial controller, I want to manage exchange rates and currency conversion, so that I can provide accurate pricing in multiple currencies.

#### Acceptance Criteria

1. THE Exchange_Rate_Manager SHALL maintain configurable exchange rates between USD and local currency
2. THE Transportation_System SHALL use published exchange rates as default when no custom rate is specified
3. THE Transportation_System SHALL allow manual override of exchange rates for specific quotations
4. THE Transportation_System SHALL display prices in both USD and HNL (or configured local currency)
5. THE Transportation_System SHALL store exchange rate history for audit purposes

### Requirement 7

**User Story:** As a system administrator, I want to manage system parameters, so that I can keep fuel prices, meal costs, and other variables up to date.

#### Acceptance Criteria

1. THE Parameter_Manager SHALL provide an interface to update fuel prices
2. THE Parameter_Manager SHALL allow configuration of meal costs per day
3. THE Parameter_Manager SHALL enable updates to hotel/lodging costs
4. THE Parameter_Manager SHALL maintain parameter change history with timestamps
5. THE Transportation_System SHALL apply parameter changes to new quotations immediately

### Requirement 8

**User Story:** As a transportation planner, I want to see detailed cost breakdowns, so that I can understand all components contributing to the total quotation.

#### Acceptance Criteria

1. THE Transportation_System SHALL display a detailed costs table showing fuel expenses
2. THE Transportation_System SHALL show driver per-diem expenses broken down by meals and lodging
3. THE Transportation_System SHALL display vehicle operational costs (per km and per day)
4. THE Transportation_System SHALL show refueling costs when applicable for long-distance trips
5. THE Transportation_System SHALL provide a summary of all cost components with totals

### Requirement 9

**User Story:** As a route planner, I want to see the actual travel route on a map, so that I can verify the path and identify potential issues.

#### Acceptance Criteria

1. THE Route_Calculator SHALL display the calculated route on an interactive Google Map
2. THE Transportation_System SHALL show origin, destination, and base locations as markers on the map
3. THE Route_Calculator SHALL display estimated travel time and total distance
4. THE Transportation_System SHALL allow users to view alternative routes when available
5. THE Maps_API SHALL provide turn-by-turn directions for the selected route

### Requirement 10

**User Story:** As a transportation coordinator, I want the system to automatically select appropriate vehicles based on group size, so that I can ensure adequate capacity for all passengers.

#### Acceptance Criteria

1. WHEN a user enters group size, THE Transportation_System SHALL filter vehicles that can accommodate the specified number of passengers
2. THE Transportation_System SHALL display only vehicles with capacity greater than or equal to the group size
3. THE Transportation_System SHALL show vehicle capacity information alongside other specifications
4. IF no vehicles can accommodate the group size, THEN THE Transportation_System SHALL suggest splitting into multiple vehicles
5. THE Transportation_System SHALL calculate costs for multiple vehicles when group exceeds single vehicle capacity

### Requirement 11

**User Story:** As a business owner, I want the system to handle different measurement units, so that I can work with various vehicle specifications and regional preferences.

#### Acceptance Criteria

1. THE Transportation_System SHALL support multiple distance units (kilometers and miles)
2. THE Transportation_System SHALL support multiple fuel efficiency units (mpg, mpl, kpl, kpg)
3. THE Transportation_System SHALL allow configuration of preferred units per vehicle
4. THE Transportation_System SHALL convert between units automatically for calculations
5. THE Transportation_System SHALL display results in the user's preferred unit system