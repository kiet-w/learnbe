import { OrderStatus, ProductStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';

const CUSTOMER_EMAIL = 'customer@example.com';
const ADMIN_EMAIL = 'admin@example.com';
const DEFAULT_PASSWORD = 'password123';
const TEST_PRODUCT_PREFIX = 'e2e-product-';

export async function loginAsCustomer(app: INestApplication) {
  return login(app, CUSTOMER_EMAIL, DEFAULT_PASSWORD);
}

export async function loginAsAdmin(app: INestApplication) {
  return login(app, ADMIN_EMAIL, DEFAULT_PASSWORD);
}

async function login(app: INestApplication, email: string, password: string) {
  const agent = request.agent(app.getHttpServer());
  await agent.post('/auth/login').send({ email, password }).expect(201);
  return agent;
}

export async function expectLoginCookies(
  app: INestApplication,
  email: string,
  password: string,
) {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password })
    .expect(201);

  const cookies = response.headers['set-cookie'] ?? [];

  expect(cookies.some((cookie) => cookie.includes('access_token='))).toBe(true);
  expect(cookies.some((cookie) => cookie.includes('refresh_token='))).toBe(
    true,
  );

  return response;
}

export async function getUserByEmail(prisma: PrismaService, email: string) {
  return prisma.user.findUniqueOrThrow({ where: { email } });
}

export async function getSeedProduct(prisma: PrismaService, slug: string) {
  return prisma.product.findUniqueOrThrow({ where: { slug } });
}

export async function getSeedCategory(prisma: PrismaService, slug: string) {
  return prisma.category.findUniqueOrThrow({ where: { slug } });
}

export async function resetCustomerState(prisma: PrismaService) {
  const customer = await getUserByEmail(prisma, CUSTOMER_EMAIL);

  const orders = await prisma.order.findMany({
    where: { userId: customer.id },
    select: { id: true },
  });

  if (orders.length > 0) {
    const orderIds = orders.map((order) => order.id);
    await prisma.orderItem.deleteMany({
      where: { orderId: { in: orderIds } },
    });
    await prisma.order.deleteMany({
      where: { id: { in: orderIds } },
    });
  }

  const carts = await prisma.cart.findMany({
    where: { userId: customer.id },
    select: { id: true },
  });

  if (carts.length > 0) {
    const cartIds = carts.map((cart) => cart.id);
    await prisma.cartItem.deleteMany({
      where: { cartId: { in: cartIds } },
    });
    await prisma.cart.deleteMany({
      where: { id: { in: cartIds } },
    });
  }

  await prisma.user.update({
    where: { id: customer.id },
    data: { refreshToken: null },
  });
}

export async function deleteTestProducts(prisma: PrismaService) {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { slug: { startsWith: TEST_PRODUCT_PREFIX } },
        { name: { startsWith: 'E2E Product ' } },
      ],
    },
    select: { id: true },
  });

  if (products.length === 0) {
    return;
  }

  const productIds = products.map((product) => product.id);
  await prisma.productImage.deleteMany({
    where: { productId: { in: productIds } },
  });
  await prisma.product.deleteMany({
    where: { id: { in: productIds } },
  });
}

export async function setProductStock(
  prisma: PrismaService,
  slug: string,
  stock: number,
) {
  await prisma.product.update({
    where: { slug },
    data: {
      stock,
      status: ProductStatus.ACTIVE,
      deletedAt: null,
    },
  });
}

export async function createCheckoutOrderForCustomer(
  app: INestApplication,
  prisma: PrismaService,
) {
  await resetCustomerState(prisma);
  await setProductStock(prisma, 'iphone-15', 10);

  const product = await getSeedProduct(prisma, 'iphone-15');
  const agent = await loginAsCustomer(app);

  await agent
    .post('/cart/items')
    .send({ productId: product.id, quantity: 1 })
    .expect(201);

  const checkoutResponse = await agent
    .post('/orders/checkout')
    .send({ address: '123 Test Street, Ho Chi Minh City' })
    .expect(201);

  return checkoutResponse.body.data as { id: number; status: OrderStatus };
}

export async function ensureAdminAndCustomer(prisma: PrismaService) {
  const users = await prisma.user.findMany({
    where: {
      email: { in: [ADMIN_EMAIL, CUSTOMER_EMAIL] },
    },
    select: {
      email: true,
      role: true,
    },
  });

  expect(users).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        email: ADMIN_EMAIL,
        role: UserRole.ADMIN,
      }),
      expect.objectContaining({
        email: CUSTOMER_EMAIL,
        role: UserRole.CUSTOMER,
      }),
    ]),
  );
}

export function buildTestProductPayload(categoryId: number, suffix: string) {
  return {
    name: `E2E Product ${suffix}`,
    slug: `${TEST_PRODUCT_PREFIX}${suffix}`,
    description: 'Product created by e2e test',
    price: '123.45',
    stock: 5,
    categoryId,
    status: ProductStatus.ACTIVE,
    images: [
      {
        url: `https://example.com/${suffix}.jpg`,
        alt: `E2E Product ${suffix}`,
      },
    ],
  };
}
