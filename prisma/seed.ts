import { UserRole } from '@prisma/client';
import { hashPassword } from '../src/lib/auth/password';
import prisma from '../src/lib/db/prisma';

async function main() {
  console.log('Seeding database...');

  // Check if users already exist
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log('Database already seeded');
    return;
  }

  // Create default users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: UserRole.admin,
      password: await hashPassword('admin123'),
      isActive: true,
    },
  });
  console.log('Created admin user');

  const accountant = await prisma.user.create({
    data: {
      email: 'accountant@example.com',
      name: 'Accountant User',
      role: UserRole.accountant,
      password: await hashPassword('accountant123'),
      isActive: true,
    },
  });
  console.log('Created accountant user');

  const regularUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'Regular User',
      role: UserRole.user,
      password: await hashPassword('user123'),
      isActive: true,
    },
  });
  console.log('Created regular user');

  // Create default categories
  const categories = [
    {
      name: 'Food & Dining',
      description: 'Groceries, restaurants, and food delivery',
      color: '#FF6B6B',
      icon: 'utensils',
      isDefault: true,
      createdBy: admin.id,
    },
    {
      name: 'Transportation',
      description: 'Fuel, public transport, car maintenance',
      color: '#4ECDC4',
      icon: 'car',
      isDefault: true,
      createdBy: admin.id,
    },
    {
      name: 'Entertainment',
      description: 'Movies, games, subscriptions, hobbies',
      color: '#95E1D3',
      icon: 'ticket',
      isDefault: true,
      createdBy: admin.id,
    },
    {
      name: 'Shopping',
      description: 'Clothing, electronics, and general shopping',
      color: '#F38181',
      icon: 'shopping-bag',
      isDefault: true,
      createdBy: admin.id,
    },
    {
      name: 'Bills & Utilities',
      description: 'Electricity, water, internet, phone bills',
      color: '#AA96DA',
      icon: 'file-text',
      isDefault: true,
      createdBy: admin.id,
    },
    {
      name: 'Healthcare',
      description: 'Medical expenses, pharmacy, insurance',
      color: '#FCBAD3',
      icon: 'heart-pulse',
      isDefault: true,
      createdBy: admin.id,
    },
    {
      name: 'Other',
      description: 'Miscellaneous expenses',
      color: '#C7CEEA',
      icon: 'package',
      isDefault: true,
      createdBy: admin.id,
    },
  ];

  for (const category of categories) {
    await prisma.category.create({
      data: category,
    });
    console.log(`Created category: ${category.name}`);
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
