import { RouteCalculatorService, RouteResult, DistanceMatrixResult, ErrorType, AppError } from '@/types';
import { routeCache, distanceCache, createCacheKey, memoizeAsync } from '@/utils/cache';

/**
 * Service for calculating routes and distances using Google Maps APIs
 * Refactored from existing Google Maps integration with proper error handling
 */
export class RouteCalculatorServiceImpl implements RouteCalculatorService {
  private distanceMatrixService: google.maps.DistanceMatrixService | null = null;
  private directionsService: google.maps.DirectionsService | null = null;

  constructor() {
    this.initializeServices();
  }

  private initializeServices(): void {
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      this.distanceMatrixService = new google.maps.DistanceMatrixService();
      this.directionsService = new google.maps.DirectionsService();
    }
  }

  private ensureServicesInitialized(): void {
    if (!this.distanceMatrixService || !this.directionsService) {
      this.initializeServices();
      if (!this.distanceMatrixService || !this.directionsService) {
        throw new Error('Google Maps services not available');
      }
    }
  }

  /**
   * Calculate route between origin, destination, and base location
   * Supports calculating distances between all three points
   */
  async calculateRoute(origin: string, destination: string, baseLocation: string): Promise<RouteResult> {
    // Create cache key for this route calculation
    const cacheKey = createCacheKey('route', { origin, destination, baseLocation });

    // Check cache first
    const cached = routeCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      this.ensureServicesInitialized();

      // Calculate distance matrix for all combinations
      const matrixResult = await this.getDistanceMatrix(
        [baseLocation, origin],
        [baseLocation, destination]
      );

      // Calculate main route directions
      const directionsResult = await this.getDirections(origin, destination);

      // Extract route segments
      const segments = this.extractRouteSegments(matrixResult, baseLocation, origin, destination);

      // Calculate total distance and time
      const totalDistance = segments.reduce((sum, segment) => sum + segment.distance, 0);
      const totalTime = segments.reduce((sum, segment) => sum + segment.duration, 0);

      const result = {
        totalDistance,
        totalTime,
        route: directionsResult,
        segments
      };

      // Cache the result
      routeCache.set(cacheKey, result);

      return result;

    } catch (error) {
      throw this.handleError(error, 'Failed to calculate route');
    }
  }

  /**
   * Get distance matrix between multiple origins and destinations
   */
  async getDistanceMatrix(origins: string[], destinations: string[]): Promise<DistanceMatrixResult> {
    // Create cache key for this distance matrix request
    const cacheKey = createCacheKey('distance-matrix', { origins, destinations });

    // Check cache first
    const cached = distanceCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      this.ensureServicesInitialized();

      const response = await new Promise<google.maps.DistanceMatrixResponse>((resolve, reject) => {
        this.distanceMatrixService!.getDistanceMatrix(
          {
            origins,
            destinations,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false,
          },
          (response, status) => {
            if (status === google.maps.DistanceMatrixStatus.OK && response) {
              resolve(response);
            } else {
              reject(new Error(`Distance Matrix API error: ${status}`));
            }
          }
        );
      });

      const result = this.parseDistanceMatrixResponse(response, origins, destinations);

      // Cache the result
      distanceCache.set(cacheKey, result);

      return result;

    } catch (error) {
      throw this.handleError(error, 'Failed to get distance matrix');
    }
  }

  /**
   * Get directions between two points
   */
  private async getDirections(origin: string, destination: string): Promise<google.maps.DirectionsResult> {
    return new Promise((resolve, reject) => {
      this.directionsService!.route(
        {
          origin,
          destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
          if (status === google.maps.DirectionsStatus.OK && response) {
            resolve(response);
          } else {
            reject(new Error(`Directions API error: ${status}`));
          }
        }
      );
    });
  }

  /**
   * Parse distance matrix response into structured format
   */
  private parseDistanceMatrixResponse(
    response: google.maps.DistanceMatrixResponse,
    origins: string[],
    destinations: string[]
  ): DistanceMatrixResult {
    const distances: number[][] = [];
    const durations: number[][] = [];

    response.rows.forEach((row, originIndex) => {
      distances[originIndex] = [];
      durations[originIndex] = [];

      row.elements.forEach((element, destIndex) => {
        if (element.status === 'OK') {
          distances[originIndex][destIndex] = Math.round(element.distance.value / 1000); // Convert to km
          durations[originIndex][destIndex] = Math.round(element.duration.value / 60); // Convert to minutes
        } else {
          distances[originIndex][destIndex] = 0;
          durations[originIndex][destIndex] = 0;
        }
      });
    });

    return {
      origins,
      destinations,
      distances,
      durations
    };
  }

  /**
   * Extract route segments from distance matrix
   */
  private extractRouteSegments(
    matrixResult: DistanceMatrixResult,
    baseLocation: string,
    origin: string,
    destination: string
  ) {
    const segments = [];

    // Base to Origin
    if (matrixResult.distances[0] && matrixResult.distances[0][0] !== undefined) {
      segments.push({
        origin: baseLocation,
        destination: origin,
        distance: matrixResult.distances[1][0], // From origin row to base column
        duration: matrixResult.durations[1][0]
      });
    }

    // Origin to Destination
    if (matrixResult.distances[1] && matrixResult.distances[1][1] !== undefined) {
      segments.push({
        origin,
        destination,
        distance: matrixResult.distances[1][1], // From origin row to destination column
        duration: matrixResult.durations[1][1]
      });
    }

    // Destination to Base
    if (matrixResult.distances[0] && matrixResult.distances[0][1] !== undefined) {
      segments.push({
        origin: destination,
        destination: baseLocation,
        distance: matrixResult.distances[0][1], // From base row to destination column
        duration: matrixResult.durations[0][1]
      });
    }

    return segments;
  }

  /**
   * Handle and transform errors into AppError format
   */
  private handleError(error: any, message: string): AppError {
    console.error('RouteCalculatorService error:', error);

    if (error.message?.includes('API error')) {
      return {
        type: ErrorType.API_ERROR,
        message: `${message}: ${error.message}`,
        details: error
      };
    }

    if (error.message?.includes('not found') || error.message?.includes('ZERO_RESULTS')) {
      return {
        type: ErrorType.LOCATION_NOT_FOUND,
        message: `${message}: One or more locations could not be found`,
        details: error
      };
    }

    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      return {
        type: ErrorType.NETWORK_ERROR,
        message: `${message}: Network connection error`,
        details: error
      };
    }

    return {
      type: ErrorType.CALCULATION_ERROR,
      message: `${message}: ${error.message || 'Unknown error'}`,
      details: error
    };
  }
}

// Export singleton instance
export const routeCalculatorService = new RouteCalculatorServiceImpl();