import { getStorageAdapter } from './LocalStorageAdapter';
import { Collections } from './StorageInterface';
import { User, Category, UserRole } from '@/types/models';
import { hashPassword } from '../auth/password';
import { v4 as uuidv4 } from 'uuid';

/**
 * Data migration and initialization utilities
 */

/**
 * Check if the database has been initialized
 */
export async function isInitialized(): Promise<boolean> {
  const storage = getStorageAdapter();
  const userCount = await storage.count(Collections.USERS);
  return userCount > 0;
}

/**
 * Initialize the database with default data
 */
export async function initializeDatabase(): Promise<void> {
  const storage = getStorageAdapter();
  await storage.initialize();

  // Check if already initialized
  if (await isInitialized()) {
    console.log('Database already initialized');
    return;
  }

  console.log('Initializing database with default data...');

  // Create default users
  await createDefaultUsers();

  // Create default categories
  await createDefaultCategories();

  console.log('Database initialization complete');
}

/**
 * Create default users (admin, accountant, regular user)
 */
async function createDefaultUsers(): Promise<void> {
  const storage = getStorageAdapter();
  const now = new Date().toISOString();

  const defaultUsers: Omit<User, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      email: 'admin@example.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      password: await hashPassword('admin123'),
      isActive: true,
    },
    {
      email: 'accountant@example.com',
      name: 'Accountant User',
      role: UserRole.ACCOUNTANT,
      password: await hashPassword('accountant123'),
      isActive: true,
    },
    {
      email: 'user@example.com',
      name: 'Regular User',
      role: UserRole.USER,
      password: await hashPassword('user123'),
      isActive: true,
    },
  ];

  for (const userData of defaultUsers) {
    const user: User = {
      id: uuidv4(),
      ...userData,
      createdAt: now,
      updatedAt: now,
    };
    await storage.create(Collections.USERS, user);
    console.log(`Created user: ${user.email}`);
  }
}

/**
 * Create default categories
 */
async function createDefaultCategories(): Promise<void> {
  const storage = getStorageAdapter();
  const now = new Date().toISOString();

  // Get admin user ID for createdBy field
  const users = await storage.getAll<User>(Collections.USERS);
  const admin = users.find((u) => u.role === UserRole.ADMIN);
  const adminId = admin?.id || 'system';

  const defaultCategories: Omit<Category, 'id' | 'createdAt'>[] = [
    {
      name: 'Food & Dining',
      description: 'Groceries, restaurants, and food delivery',
      color: '#FF6B6B',
      icon: 'utensils',
      isDefault: true,
      isActive: true,
      createdBy: adminId,
    },
    {
      name: 'Transportation',
      description: 'Fuel, public transport, car maintenance',
      color: '#4ECDC4',
      icon: 'car',
      isDefault: true,
      isActive: true,
      createdBy: adminId,
    },
    {
      name: 'Entertainment',
      description: 'Movies, games, subscriptions, hobbies',
      color: '#95E1D3',
      icon: 'ticket',
      isDefault: true,
      isActive: true,
      createdBy: adminId,
    },
    {
      name: 'Shopping',
      description: 'Clothing, electronics, and general shopping',
      color: '#F38181',
      icon: 'shopping-bag',
      isDefault: true,
      isActive: true,
      createdBy: adminId,
    },
    {
      name: 'Bills & Utilities',
      description: 'Electricity, water, internet, phone bills',
      color: '#AA96DA',
      icon: 'file-text',
      isDefault: true,
      isActive: true,
      createdBy: adminId,
    },
    {
      name: 'Healthcare',
      description: 'Medical expenses, pharmacy, insurance',
      color: '#FCBAD3',
      icon: 'heart-pulse',
      isDefault: true,
      isActive: true,
      createdBy: adminId,
    },
    {
      name: 'Other',
      description: 'Miscellaneous expenses',
      color: '#C7CEEA',
      icon: 'package',
      isDefault: true,
      isActive: true,
      createdBy: adminId,
    },
  ];

  for (const categoryData of defaultCategories) {
    const category: Category = {
      id: uuidv4(),
      ...categoryData,
      createdAt: now,
    };
    await storage.create(Collections.CATEGORIES, category);
    console.log(`Created category: ${category.name}`);
  }
}

/**
 * Reset the entire database (for development/testing)
 */
export async function resetDatabase(): Promise<void> {
  const storage = getStorageAdapter();
  await storage.clearAll();
  await initializeDatabase();
  console.log('Database reset complete');
}

/**
 * Export all data to JSON (for backup)
 */
export async function exportDatabase(): Promise<string> {
  const storage = getStorageAdapter();
  const data = await storage.exportAll();
  return JSON.stringify(data, null, 2);
}

/**
 * Import data from JSON (for restore)
 */
export async function importDatabase(jsonData: string): Promise<void> {
  const storage = getStorageAdapter();
  const data = JSON.parse(jsonData);
  await storage.importAll(data);
  console.log('Database import complete');
}
