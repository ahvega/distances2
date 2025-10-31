/**
 * Cache utilities for API responses and expensive operations
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class MemoryCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) { // 5 minutes default
    this.defaultTTL = defaultTTL;
  }

  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    // Clean expired entries first
    this.cleanExpired();
    return this.cache.size;
  }

  private cleanExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Get cache statistics
  getStats() {
    this.cleanExpired();
    const values: CacheEntry<T>[] = [];
    this.cache.forEach(entry => values.push(entry));

    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      oldestEntry: values.length > 0 ? Math.min(...values.map(e => e.timestamp)) : 0,
      newestEntry: values.length > 0 ? Math.max(...values.map(e => e.timestamp)) : 0
    };
  }
}

/**
 * Create a cache key from parameters
 */
export function createCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${JSON.stringify(params[key])}`)
    .join('|');

  return `${prefix}:${sortedParams}`;
}

/**
 * Memoization decorator for async functions
 */
export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  cache: MemoryCache<any>,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    // Check cache first
    const cached = cache.get(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    try {
      const result = await fn(...args);
      cache.set(key, result);
      return result;
    } catch (error) {
      // Don't cache errors
      throw error;
    }
  }) as T;
}

// Global caches for different types of data
export const routeCache = new MemoryCache<any>(10 * 60 * 1000); // 10 minutes for routes
export const placesCache = new MemoryCache<any>(30 * 60 * 1000); // 30 minutes for places
export const distanceCache = new MemoryCache<any>(15 * 60 * 1000); // 15 minutes for distances