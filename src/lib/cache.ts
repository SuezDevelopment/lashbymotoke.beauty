type CacheEntry<T> = { value: T; expiresAt?: number };

export class Cache {
  private static store = new Map<string, CacheEntry<any>>();

  static set<T>(key: string, value: T, ttlMs?: number): void {
    const entry: CacheEntry<T> = { value };
    if (ttlMs && ttlMs > 0) entry.expiresAt = Date.now() + ttlMs;
    Cache.store.set(key, entry);
  }

  static get<T>(key: string): T | undefined {
    const entry = Cache.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      Cache.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  static del(key: string): void {
    Cache.store.delete(key);
  }

  static clear(): void {
    Cache.store.clear();
  }
}

export const CACHE_KEYS = {
  SERVICES_LIST: 'services:list',
  TRAINING_PROGRAMS: 'training:programs',
  EMAIL_TEMPLATES: 'email:templates',
} as const;