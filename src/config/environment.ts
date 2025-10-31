// Environment Configuration
export const config = {
  // Google Maps API Configuration
  googleMaps: {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places', 'geometry'] as const,
  },

  // Application Configuration
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'PlannerTours',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '2.0.0',
  },

  // External API Configuration
  apis: {
    exchangeRateUrl: process.env.EXCHANGE_RATE_API_URL || 'https://api.exchangerate.host/latest?base=USD&symbols=HNL',
  },

  // Development flags
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;

// Validation function to ensure required environment variables are set
export function validateEnvironment(): void {
  const requiredVars = [
    'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
}

// Export individual config sections for convenience
export const { googleMaps, app, apis, isDevelopment, isProduction } = config;