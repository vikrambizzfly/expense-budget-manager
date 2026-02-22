import { getStorageAdapter } from '../storage/LocalStorageAdapter';
import { Collections } from '../storage/StorageInterface';
import { User, SafeUser, UserFormData, UserRole } from '@/types/models';
import { PermissionChecker } from '../auth/permissions';
import { hashPassword, validatePassword } from '../auth/password';
import { v4 as uuidv4 } from 'uuid';

export class UserService {
  private storage = getStorageAdapter();

  /**
   * Get all users (Admin only)
   */
  async getAllUsers(userRole: UserRole): Promise<SafeUser[]> {
    if (!PermissionChecker.canManageUsers(userRole)) {
      throw new Error('Unauthorized: Only admins can view all users');
    }

    const users = await this.storage.getAll<User>(Collections.USERS);
    return users.map(this.toSafeUser);
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string, requestingUserRole: UserRole, requestingUserId: string): Promise<SafeUser | null> {
    // Users can view their own profile, admins can view anyone
    if (!PermissionChecker.canManageUsers(requestingUserRole) && id !== requestingUserId) {
      throw new Error('Unauthorized: Cannot view other users');
    }

    const user = await this.storage.get<User>(Collections.USERS, id);
    return user ? this.toSafeUser(user) : null;
  }

  /**
   * Create a new user (Admin only)
   */
  async createUser(data: UserFormData, requestingUserRole: UserRole): Promise<SafeUser> {
    if (!PermissionChecker.canManageUsers(requestingUserRole)) {
      throw new Error('Unauthorized: Only admins can create users');
    }

    // Check if user already exists
    const existing = await this.storage.query<User>(
      Collections.USERS,
      (user) => user.email.toLowerCase() === data.email.toLowerCase()
    );

    if (existing.length > 0) {
      throw new Error('User with this email already exists');
    }

    // Validate and hash password if provided
    let hashedPassword = '';
    if (data.password) {
      const validation = validatePassword(data.password);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      hashedPassword = await hashPassword(data.password);
    } else {
      // Generate a default password if not provided
      hashedPassword = await hashPassword('changeme123');
    }

    const now = new Date().toISOString();
    const user: User = {
      id: uuidv4(),
      email: data.email.toLowerCase(),
      name: data.name,
      role: data.role,
      password: hashedPassword,
      isActive: data.isActive,
      createdAt: now,
      updatedAt: now,
    };

    await this.storage.create(Collections.USERS, user);
    return this.toSafeUser(user);
  }

  /**
   * Update a user (Admin only)
   */
  async updateUser(
    id: string,
    data: Partial<UserFormData>,
    requestingUserRole: UserRole
  ): Promise<SafeUser> {
    if (!PermissionChecker.canManageUsers(requestingUserRole)) {
      throw new Error('Unauthorized: Only admins can update users');
    }

    const user = await this.storage.get<User>(Collections.USERS, id);

    if (!user) {
      throw new Error('User not found');
    }

    // Check if updating email to an existing one
    if (data.email && data.email !== user.email) {
      const existing = await this.storage.query<User>(
        Collections.USERS,
        (u) => u.email.toLowerCase() === data.email!.toLowerCase() && u.id !== id
      );

      if (existing.length > 0) {
        throw new Error('User with this email already exists');
      }
    }

    // Hash password if being updated
    const updateData: any = { ...data };
    if (data.password) {
      const validation = validatePassword(data.password);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      updateData.password = await hashPassword(data.password);
    } else {
      delete updateData.password; // Don't update password if not provided
    }

    updateData.updatedAt = new Date().toISOString();

    const updated = await this.storage.update(Collections.USERS, id, updateData);
    return this.toSafeUser(updated);
  }

  /**
   * Delete a user (Admin only, cannot delete self)
   */
  async deleteUser(
    id: string,
    requestingUserRole: UserRole,
    requestingUserId: string
  ): Promise<void> {
    if (!PermissionChecker.canManageUsers(requestingUserRole)) {
      throw new Error('Unauthorized: Only admins can delete users');
    }

    if (id === requestingUserId) {
      throw new Error('Cannot delete your own account');
    }

    const user = await this.storage.get<User>(Collections.USERS, id);

    if (!user) {
      throw new Error('User not found');
    }

    // Soft delete by deactivating
    await this.storage.update(Collections.USERS, id, {
      isActive: false,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Convert User to SafeUser (remove password)
   */
  private toSafeUser(user: User): SafeUser {
    const { password, ...safeUser } = user;
    return safeUser;
  }
}

// Singleton instance
let userServiceInstance: UserService | null = null;

export function getUserService(): UserService {
  if (!userServiceInstance) {
    userServiceInstance = new UserService();
  }
  return userServiceInstance;
}
