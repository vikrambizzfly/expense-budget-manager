import prisma from '../db/prisma';
import { hashPassword, comparePassword, validatePassword } from '../auth/password';
import { generateToken } from '../auth/jwt';
import {
  SafeUser,
  LoginCredentials,
  RegisterData,
  AuthToken,
  UserRole,
} from '@/types/models';

export class AuthServicePrisma {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthToken> {
    const { email, password } = credentials;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

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
      role: user.role as UserRole,
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
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        role: role || UserRole.USER,
        password: hashedPassword,
        isActive: true,
      },
    });

    // Generate JWT token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role as UserRole,
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    return user ? this.toSafeUser(user) : null;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<SafeUser | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

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
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

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
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });
  }

  /**
   * Convert User to SafeUser (remove password)
   */
  private toSafeUser(user: any): SafeUser {
    const { password, ...safeUser } = user;
    return {
      ...safeUser,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}

// Singleton instance
let authServiceInstance: AuthServicePrisma | null = null;

export function getAuthServicePrisma(): AuthServicePrisma {
  if (!authServiceInstance) {
    authServiceInstance = new AuthServicePrisma();
  }
  return authServiceInstance;
}
