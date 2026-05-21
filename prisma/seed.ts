import { PrismaClient, Prisma, ProductStatus, UserRole } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcryptjs';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function seedUsers() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      name: 'Store Admin',
      password: passwordHash,
      role: UserRole.ADMIN,
    },
    create: {
      name: 'Store Admin',
      email: 'admin@example.com',
      password: passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {
      name: 'Demo Customer',
      password: passwordHash,
      role: UserRole.CUSTOMER,
    },
    create: {
      name: 'Demo Customer',
      email: 'customer@example.com',
      password: passwordHash,
      role: UserRole.CUSTOMER,
    },
  });

  return { admin, customer };
}

async function seedCategories() {
  const categories = [
    {
      name: 'Phones',
      slug: 'phones',
      description: 'Smartphones and mobile devices',
    },
    {
      name: 'Laptops',
      slug: 'laptops',
      description: 'Portable computers for work and study',
    },
    {
      name: 'Audio',
      slug: 'audio',
      description: 'Headphones, earbuds, and speakers',
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  return prisma.category.findMany({ orderBy: { id: 'asc' } });
}

async function seedProducts(categories: { id: number; slug: string }[]) {
  const categoryMap = new Map(categories.map((category) => [category.slug, category.id]));

  const products = [
    {
      name: 'iPhone 15',
      slug: 'iphone-15',
      description: 'Apple smartphone with advanced camera and performance.',
      price: '999.00',
      stock: 25,
      status: ProductStatus.ACTIVE,
      categorySlug: 'phones',
      imageUrl: 'https://example.com/images/iphone-15.jpg',
    },
    {
      name: 'Samsung Galaxy S24',
      slug: 'samsung-galaxy-s24',
      description: 'Flagship Android smartphone with bright display.',
      price: '899.00',
      stock: 18,
      status: ProductStatus.ACTIVE,
      categorySlug: 'phones',
      imageUrl: 'https://example.com/images/galaxy-s24.jpg',
    },
    {
      name: 'Google Pixel 9',
      slug: 'google-pixel-9',
      description: 'Clean Android phone with AI-assisted camera features.',
      price: '799.00',
      stock: 14,
      status: ProductStatus.ACTIVE,
      categorySlug: 'phones',
      imageUrl: 'https://example.com/images/pixel-9.jpg',
    },
    {
      name: 'MacBook Air M3',
      slug: 'macbook-air-m3',
      description: 'Thin laptop for productivity and everyday development.',
      price: '1299.00',
      stock: 10,
      status: ProductStatus.ACTIVE,
      categorySlug: 'laptops',
      imageUrl: 'https://example.com/images/macbook-air-m3.jpg',
    },
    {
      name: 'Dell XPS 13',
      slug: 'dell-xps-13',
      description: 'Compact premium ultrabook with strong build quality.',
      price: '1199.00',
      stock: 9,
      status: ProductStatus.ACTIVE,
      categorySlug: 'laptops',
      imageUrl: 'https://example.com/images/dell-xps-13.jpg',
    },
    {
      name: 'Lenovo ThinkPad X1 Carbon',
      slug: 'lenovo-thinkpad-x1-carbon',
      description: 'Business laptop with durable keyboard and long battery life.',
      price: '1499.00',
      stock: 7,
      status: ProductStatus.ACTIVE,
      categorySlug: 'laptops',
      imageUrl: 'https://example.com/images/thinkpad-x1-carbon.jpg',
    },
    {
      name: 'Sony WH-1000XM5',
      slug: 'sony-wh-1000xm5',
      description: 'Wireless noise-cancelling headphones for travel and work.',
      price: '399.00',
      stock: 30,
      status: ProductStatus.ACTIVE,
      categorySlug: 'audio',
      imageUrl: 'https://example.com/images/sony-wh-1000xm5.jpg',
    },
    {
      name: 'AirPods Pro 2',
      slug: 'airpods-pro-2',
      description: 'Wireless earbuds with active noise cancellation.',
      price: '249.00',
      stock: 35,
      status: ProductStatus.ACTIVE,
      categorySlug: 'audio',
      imageUrl: 'https://example.com/images/airpods-pro-2.jpg',
    },
    {
      name: 'JBL Charge 5',
      slug: 'jbl-charge-5',
      description: 'Portable speaker with strong battery and punchy sound.',
      price: '179.00',
      stock: 22,
      status: ProductStatus.ACTIVE,
      categorySlug: 'audio',
      imageUrl: 'https://example.com/images/jbl-charge-5.jpg',
    },
    {
      name: 'Nothing Ear',
      slug: 'nothing-ear',
      description: 'Stylish earbuds with balanced sound and ANC.',
      price: '149.00',
      stock: 12,
      status: ProductStatus.ACTIVE,
      categorySlug: 'audio',
      imageUrl: 'https://example.com/images/nothing-ear.jpg',
    },
  ];

  for (const product of products) {
    const categoryId = categoryMap.get(product.categorySlug);

    if (!categoryId) {
      throw new Error(`Missing category for slug: ${product.categorySlug}`);
    }

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        price: new Prisma.Decimal(product.price),
        stock: product.stock,
        status: product.status,
        deletedAt: null,
        categoryId,
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: new Prisma.Decimal(product.price),
        stock: product.stock,
        status: product.status,
        categoryId,
        images: {
          create: [
            {
              url: product.imageUrl,
              alt: product.name,
            },
          ],
        },
      },
    });
  }
}

async function main() {
  console.log('Starting ecommerce seed...');

  const users = await seedUsers();
  const categories = await seedCategories();
  await seedProducts(categories);

  console.log(`Seeded admin user: ${users.admin.email}`);
  console.log(`Seeded customer user: ${users.customer.email}`);
  console.log(`Seeded categories: ${categories.length}`);
  console.log('Seeded products: 10');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
