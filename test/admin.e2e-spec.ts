import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { closeE2EApp, createE2EApp } from './e2e-app';
import {
  buildTestProductPayload,
  createCheckoutOrderForCustomer,
  deleteTestProducts,
  getSeedCategory,
  loginAsAdmin,
  resetCustomerState,
  setProductStock,
} from './e2e-helpers';

describe('Admin E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const setup = await createE2EApp();
    app = setup.app;
    prisma = setup.prisma;
  });

  beforeEach(async () => {
    await deleteTestProducts(prisma);
    await resetCustomerState(prisma);
    await setProductStock(prisma, 'iphone-15', 25);
  });

  afterAll(async () => {
    await deleteTestProducts(prisma);
    await resetCustomerState(prisma);
    await setProductStock(prisma, 'iphone-15', 25);
    await closeE2EApp(app);
  });

  it('logs in admin and creates, updates, then soft deletes a product', async () => {
    const agent = await loginAsAdmin(app);
    const category = await getSeedCategory(prisma, 'phones');
    const suffix = String(Date.now());
    const createPayload = buildTestProductPayload(category.id, suffix);

    const createResponse = await agent
      .post('/admin/products')
      .send(createPayload)
      .expect(201);

    expect(createResponse.body).toEqual({
      success: true,
      data: expect.objectContaining({
        id: expect.any(Number),
        name: createPayload.name,
        slug: createPayload.slug,
        stock: 5,
      }),
    });

    const productId = createResponse.body.data.id as number;

    const updateResponse = await agent
      .patch(`/admin/products/${productId}`)
      .send({
        name: `${createPayload.name} Updated`,
        stock: 8,
        price: '222.00',
      })
      .expect(200);

    expect(updateResponse.body).toEqual({
      success: true,
      data: expect.objectContaining({
        id: productId,
        name: `${createPayload.name} Updated`,
        stock: 8,
        price: '222',
      }),
    });

    const deleteResponse = await agent
      .delete(`/admin/products/${productId}`)
      .expect(200);

    expect(deleteResponse.body).toEqual({
      success: true,
      data: expect.objectContaining({
        id: productId,
        deletedAt: expect.any(String),
      }),
    });
  });

  it('updates order status as admin', async () => {
    const agent = await loginAsAdmin(app);
    const order = await createCheckoutOrderForCustomer(app, prisma);

    const response = await agent
      .patch(`/admin/orders/${order.id}/status`)
      .send({ status: 'CONFIRMED' })
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      data: expect.objectContaining({
        id: order.id,
        status: 'CONFIRMED',
      }),
    });
  });
});
