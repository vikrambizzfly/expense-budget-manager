import { getStorageAdapter } from '../storage/LocalStorageAdapter';
import { Collections } from '../storage/StorageInterface';
import { hashPassword, comparePassword, validatePassword } from '../auth/password';
import { generateToken } from '../auth/jwt';
import {
  User,
  SafeUser,
  LoginCredentials,
  RegisterData,
  AuthToken,
  UserRole,
} from '@/types/models';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
  private storage = getStorageAdapter();

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthToken> {
    const { email, password } = credentials;

    // Find user by email
    const users = await this.storage.query<User>(
      Collections.USERS,
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );

    const user = users[0];

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account is inactive. Please contact administrator.');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return token and user (without password)
    const safeUser = this.toSafeUser(user);

    return {
      token,
      user: safeUser,
    };
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthToken> {
    const { email, name, password, role } = data;

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    // Check if user already exists
    const existingUsers = await this.storage.query<User>(
      Collections.USERS,
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUsers.length > 0) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const now = new Date().toISOString();
    const newUser: User = {
      id: uuidv4(),
      email: email.toLowerCase(),
      name,
      role: role || UserRole.USER, // Default to regular user
      password: hashedPassword,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await this.storage.create(Collections.USERS, newUser);

    // Generate JWT token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    // Return token and user (without password)
    const safeUser = this.toSafeUser(newUser);

    return {
      token,
      user: safeUser,
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<SafeUser | null> {
    const user = await this.storage.get<User>(Collections.USERS, userId);
    return user ? this.toSafeUser(user) : null;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<SafeUser | null> {
    const users = await this.storage.query<User>(
      Collections.USERS,
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );

    const user = users[0];
    return user ? this.toSafeUser(user) : null;
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.storage.get<User>(Collections.USERS, userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user
    await this.storage.update(Collections.USERS, userId, {
      password: hashedPassword,
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
let authServiceInstance: AuthService | null = null;

export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService();
  }
  return authServiceInstance;
}
