/**
 * Storage Interface - Abstraction layer for data persistence
 *
 * This interface allows seamless migration from localStorage to a database
 * by simply swapping the adapter implementation.
 */

export interface IStorageAdapter {
  /**
   * Get a single item by ID from a collection
   */
  get<T>(collection: string, id: string): Promise<T | null>;

  /**
   * Get all items from a collection
   */
  getAll<T>(collection: string): Promise<T[]>;

  /**
   * Query items from a collection using a predicate function
   */
  query<T>(
    collection: string,
    predicate: (item: T) => boolean
  ): Promise<T[]>;

  /**
   * Create a new item in a collection
   */
  create<T extends { id: string }>(
    collection: string,
    data: T
  ): Promise<T>;

  /**
   * Update an existing item in a collection
   */
  update<T extends { id: string }>(
    collection: string,
    id: string,
    data: Partial<T>
  ): Promise<T>;

  /**
   * Delete an item from a collection
   */
  delete(collection: string, id: string): Promise<boolean>;

  /**
   * Count items in a collection
   */
  count(collection: string): Promise<number>;

  /**
   * Clear all data from a collection
   */
  clear(collection: string): Promise<void>;

  /**
   * Initialize storage (for seeding, migrations, etc.)
   */
  initialize(): Promise<void>;
}

/**
 * Collection names used throughout the application
 */
export const Collections = {
  USERS: 'users',
  CATEGORIES: 'categories',
  EXPENSES: 'expenses',
  BUDGETS: 'budgets',
  AUDIT_LOGS: 'audit_logs',
} as const;

export type CollectionName = typeof Collections[keyof typeof Collections];
