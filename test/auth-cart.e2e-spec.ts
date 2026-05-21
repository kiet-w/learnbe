import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { closeE2EApp, createE2EApp } from './e2e-app';
import {
  ensureAdminAndCustomer,
  expectLoginCookies,
  getSeedProduct,
  loginAsCustomer,
  resetCustomerState,
} from './e2e-helpers';

describe('Auth and Cart E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const setup = await createE2EApp();
    app = setup.app;
    prisma = setup.prisma;
    await ensureAdminAndCustomer(prisma);
  });

  beforeEach(async () => {
    await resetCustomerState(prisma);
  });

  afterAll(async () => {
    await resetCustomerState(prisma);
    await closeE2EApp(app);
  });

  it('logs in customer, sets cookies, and exposes authenticated profile', async () => {
    await expectLoginCookies(app, 'customer@example.com', 'password123');

    const agent = await loginAsCustomer(app);
    const meResponse = await agent.get('/auth/me').expect(200);

    expect(meResponse.body).toEqual({
      id: expect.any(Number),
      email: 'customer@example.com',
      name: null,
      role: 'CUSTOMER',
    });
  });

  it('adds, updates, and removes a cart item', async () => {
    const agent = await loginAsCustomer(app);
    const product = await getSeedProduct(prisma, 'iphone-15');

    const addResponse = await agent
      .post('/cart/items')
      .send({ productId: product.id, quantity: 2 })
      .expect(201);

    expect(addResponse.body).toEqual({
      success: true,
      data: expect.objectContaining({
        totalItems: 2,
        subtotal: '1998',
        items: [
          expect.objectContaining({
            id: expect.any(Number),
            productId: product.id,
            slug: 'iphone-15',
            quantity: 2,
            subtotal: '1998',
          }),
        ],
      }),
    });

    const itemId = addResponse.body.data.items[0].id as number;

    const updateResponse = await agent
      .patch(`/cart/items/${itemId}`)
      .send({ quantity: 3 })
      .expect(200);

    expect(updateResponse.body.data).toEqual(
      expect.objectContaining({
        totalItems: 3,
        subtotal: '2997',
        items: [
          expect.objectContaining({
            id: itemId,
            quantity: 3,
            subtotal: '2997',
          }),
        ],
      }),
    );

    const removeResponse = await agent
      .delete(`/cart/items/${itemId}`)
      .expect(200);

    expect(removeResponse.body).toEqual({
      success: true,
      data: expect.objectContaining({
        totalItems: 0,
        subtotal: '0',
        items: [],
      }),
    });
  });
});
