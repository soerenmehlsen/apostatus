interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  size: number;
}

class SimpleCache {
  private cache = new Map<string, CacheItem<unknown>>();
  private stats: CacheStats = { hits: 0, misses: 0, sets: 0, size: 0 };
  private maxSize = 1000; // Prevent memory leaks

  set<T>(key: string, data: T, ttlSeconds = 300): void {
    // Clean up if cache is getting too large
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    });

    this.stats.sets++;
    this.stats.size = this.cache.size;
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) {
      this.stats.misses++;
      return null;
    }

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.size = this.cache.size;
      return null;
    }

    this.stats.hits++;
    return item.data as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.stats.size = this.cache.size;
      return false;
    }

    return true;
  }

  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, sets: 0, size: 0 };
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.size = this.cache.size;
    }
    return deleted;
  }

  // Clean up expired items
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    this.stats.size = this.cache.size;

    // If still too large, remove oldest items
    if (this.cache.size >= this.maxSize) {
      const entries = Array.from(this.cache.entries());
      entries.sort(([, a], [, b]) => a.timestamp - b.timestamp);

      const toRemove = entries.slice(0, Math.floor(this.maxSize * 0.2));
      toRemove.forEach(([key]) => this.cache.delete(key));
      this.stats.size = this.cache.size;
    }
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Create cache keys for different patterns
  static createKey(prefix: string, ...parts: (string | number | undefined)[]): string {
    const validParts = parts.filter(part => part !== undefined);
    return `${prefix}:${validParts.join(':')}`;
  }
}

export const cache = new SimpleCache();

// Cache key patterns
export const CacheKeys = {
  DASHBOARD_DATA: 'dashboard-data',
  SESSION_BY_ID: (id: string) => SimpleCache.createKey('session', id),
  PRODUCTS_BY_LOCATION: (location?: string) => SimpleCache.createKey('products', location),
  STOCKTAKE_DATA: (sessionId?: string, location?: string) =>
    SimpleCache.createKey('stocktake', sessionId, location),
} as const;