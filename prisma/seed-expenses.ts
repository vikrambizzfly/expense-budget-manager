import { PrismaClient, PaymentMethod } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: 'file:./prisma/dev.db',
});

const prisma = new PrismaClient({ adapter });

const expenseDescriptions = [
  'Grocery shopping at Whole Foods',
  'Uber ride to office',
  'Lunch at Thai restaurant',
  'Coffee at Starbucks',
  'Gas station fill-up',
  'Netflix subscription',
  'Gym membership',
  'Phone bill',
  'Electric bill',
  'Water bill',
  'Internet service',
  'Dinner with friends',
  'Movie tickets',
  'Amazon purchase',
  'Pharmacy - medicine',
  'Haircut',
  'Dry cleaning',
  'Car maintenance',
  'Parking fee',
  'Public transport',
  'Books from Amazon',
  'Office supplies',
  'Client lunch meeting',
  'Team dinner',
  'Breakfast bagels',
  'Snacks and drinks',
  'Pizza delivery',
  'Sushi takeout',
  'Medical checkup',
  'Dentist appointment',
  'Pet food',
  'Pet vet visit',
  'Home cleaning supplies',
  'Laundry service',
  'Furniture purchase',
  'Electronics - headphones',
  'Clothing shopping',
  'Shoe purchase',
  'Birthday gift',
  'Flowers',
  'Hotel accommodation',
  'Flight ticket',
  'Train ticket',
  'Taxi fare',
  'Restaurant - fine dining',
  'Fast food lunch',
  'Grocery - weekly shop',
  'Farmers market',
  'Bakery items',
  'Deli sandwich',
  'Ice cream',
  'Concert tickets',
  'Sports event',
  'Museum entry',
  'Charitable donation',
  'Insurance premium',
  'Bank fees',
  'ATM withdrawal fee',
  'Software subscription',
  'Cloud storage',
  'Streaming service',
  'Music subscription',
  'Magazine subscription',
  'Newspaper',
  'Garden supplies',
  'Hardware store',
  'Paint supplies',
  'Home repair',
  'Plumber service',
  'Electrician service',
  'Car wash',
  'Car insurance',
  'Toll fees',
  'License renewal',
  'Postage stamps',
  'Package shipping',
  'Office rent',
  'Coworking space',
  'Business cards',
  'Marketing materials',
  'Domain renewal',
  'Web hosting',
];

const paymentMethods: PaymentMethod[] = [
  PaymentMethod.cash,
  PaymentMethod.credit_card,
  PaymentMethod.debit_card,
  PaymentMethod.bank_transfer,
  PaymentMethod.digital_wallet,
];

async function seedExpenses() {
  console.log('🌱 Seeding expenses...');

  // Get users and categories
  const users = await prisma.user.findMany();
  const categories = await prisma.category.findMany();

  if (users.length === 0 || categories.length === 0) {
    console.error('❌ No users or categories found. Run main seed first.');
    return;
  }

  const adminUser = users.find(u => u.email === 'admin@example.com')!;

  // Create 100 sample expenses over the last 6 months
  const expenses = [];
  const today = new Date();

  for (let i = 0; i < 100; i++) {
    // Random date in last 6 months
    const daysAgo = Math.floor(Math.random() * 180);
    const expenseDate = new Date(today);
    expenseDate.setDate(expenseDate.getDate() - daysAgo);

    // Random amount between $5 and $500
    const amount = Math.floor(Math.random() * 49500) + 500; // 500 cents to 50000 cents

    // Random category
    const category = categories[Math.floor(Math.random() * categories.length)];

    // Random payment method
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

    // Random description
    const description = expenseDescriptions[Math.floor(Math.random() * expenseDescriptions.length)];

    expenses.push({
      userId: adminUser.id,
      categoryId: category.id,
      amount,
      date: expenseDate,
      description,
      paymentMethod,
      notes: Math.random() > 0.7 ? `Additional notes for ${description}` : null,
      referenceId: Math.random() > 0.8 ? `REF${Math.floor(Math.random() * 10000)}` : null,
      createdBy: adminUser.id,
    });
  }

  // Insert in batches
  console.log(`Creating ${expenses.length} sample expenses...`);

  for (const expense of expenses) {
    await prisma.expense.create({ data: expense });
  }

  console.log('✅ Successfully seeded 100 expenses!');

  // Show stats
  const totalExpenses = await prisma.expense.count();
  const totalAmount = await prisma.expense.aggregate({
    _sum: { amount: true },
  });

  console.log(`\n📊 Database Stats:`);
  console.log(`   Total Expenses: ${totalExpenses}`);
  console.log(`   Total Amount: $${((totalAmount._sum.amount || 0) / 100).toFixed(2)}`);
}

seedExpenses()
  .catch((e) => {
    console.error('❌ Error seeding expenses:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
