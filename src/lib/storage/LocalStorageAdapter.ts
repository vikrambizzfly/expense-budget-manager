import { IStorageAdapter, Collections } from './StorageInterface';

/**
 * LocalStorage implementation of the storage interface
 *
 * Stores data in browser localStorage with automatic serialization/deserialization.
 * All methods are async to match the interface signature and allow easy swap
 * to database adapters later.
 */
export class LocalStorageAdapter implements IStorageAdapter {
  private readonly prefix = 'expense_manager_';
  private isInitialized = false;

  /**
   * Get the full storage key for a collection
   */
  private getKey(collection: string): string {
    return `${this.prefix}${collection}`;
  }

  /**
   * Read data from localStorage
   */
  private readCollection<T>(collection: string): T[] {
    if (typeof window === 'undefined') {
      return []; // SSR safety
    }

    try {
      const key = this.getKey(collection);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading collection ${collection}:`, error);
      return [];
    }
  }

  /**
   * Write data to localStorage
   */
  private writeCollection<T>(collection: string, data: T[]): void {
    if (typeof window === 'undefined') {
      return; // SSR safety
    }

    try {
      const key = this.getKey(collection);
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error writing collection ${collection}:`, error);
      throw new Error(`Failed to write to ${collection}`);
    }
  }

  async get<T extends { id: string }>(
    collection: string,
    id: string
  ): Promise<T | null> {
    const items = this.readCollection<T>(collection);
    return items.find((item) => item.id === id) || null;
  }

  async getAll<T>(collection: string): Promise<T[]> {
    return this.readCollection<T>(collection);
  }

  async query<T>(
    collection: string,
    predicate: (item: T) => boolean
  ): Promise<T[]> {
    const items = this.readCollection<T>(collection);
    return items.filter(predicate);
  }

  async create<T extends { id: string }>(
    collection: string,
    data: T
  ): Promise<T> {
    const items = this.readCollection<T>(collection);

    // Check for duplicate ID
    if (items.some((item) => item.id === data.id)) {
      throw new Error(`Item with id ${data.id} already exists in ${collection}`);
    }

    items.push(data);
    this.writeCollection(collection, items);
    return data;
  }

  async update<T extends { id: string }>(
    collection: string,
    id: string,
    data: Partial<T>
  ): Promise<T> {
    const items = this.readCollection<T>(collection);
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new Error(`Item with id ${id} not found in ${collection}`);
    }

    const updated = { ...items[index], ...data };
    items[index] = updated;
    this.writeCollection(collection, items);
    return updated;
  }

  async delete(collection: string, id: string): Promise<boolean> {
    const items = this.readCollection<{ id: string }>(collection);
    const filtered = items.filter((item) => item.id !== id);

    if (filtered.length === items.length) {
      return false; // Item not found
    }

    this.writeCollection(collection, filtered);
    return true;
  }

  async count(collection: string): Promise<number> {
    const items = this.readCollection(collection);
    return items.length;
  }

  async clear(collection: string): Promise<void> {
    this.writeCollection(collection, []);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (typeof window === 'undefined') {
      return; // SSR safety
    }

    // Initialize all collections if they don't exist
    Object.values(Collections).forEach((collection) => {
      const key = this.getKey(collection);
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify([]));
      }
    });

    this.isInitialized = true;
  }

  /**
   * Export all data (useful for debugging or backup)
   */
  async exportAll(): Promise<Record<string, any[]>> {
    const result: Record<string, any[]> = {};

    Object.values(Collections).forEach((collection) => {
      result[collection] = this.readCollection(collection);
    });

    return result;
  }

  /**
   * Import data (useful for restore or seeding)
   */
  async importAll(data: Record<string, any[]>): Promise<void> {
    Object.entries(data).forEach(([collection, items]) => {
      this.writeCollection(collection, items);
    });
  }

  /**
   * Clear all application data
   */
  async clearAll(): Promise<void> {
    Object.values(Collections).forEach((collection) => {
      this.clear(collection);
    });
  }
}

// Singleton instance
let storageInstance: LocalStorageAdapter | null = null;

export function getStorageAdapter(): LocalStorageAdapter {
  if (!storageInstance) {
    storageInstance = new LocalStorageAdapter();
  }
  return storageInstance;
}
