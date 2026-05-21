import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { closeE2EApp, createE2EApp } from './e2e-app';
import {
  getSeedProduct,
  loginAsCustomer,
  resetCustomerState,
  setProductStock,
} from './e2e-helpers';

describe('Checkout and Orders E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const setup = await createE2EApp();
    app = setup.app;
    prisma = setup.prisma;
  });

  beforeEach(async () => {
    await resetCustomerState(prisma);
    await setProductStock(prisma, 'iphone-15', 25);
  });

  afterAll(async () => {
    await resetCustomerState(prisma);
    await setProductStock(prisma, 'iphone-15', 25);
    await closeE2EApp(app);
  });

  it('checks out successfully and returns order list/detail', async () => {
    const agent = await loginAsCustomer(app);
    const product = await getSeedProduct(prisma, 'iphone-15');

    await agent
      .post('/cart/items')
      .send({ productId: product.id, quantity: 2 })
      .expect(201);

    const checkoutResponse = await agent
      .post('/orders/checkout')
      .send({ address: '123 Test Street, Ho Chi Minh City' })
      .expect(201);

    expect(checkoutResponse.body).toEqual({
      success: true,
      data: expect.objectContaining({
        id: expect.any(Number),
        status: 'PENDING',
        address: '123 Test Street, Ho Chi Minh City',
        total: '1998',
        items: [
          expect.objectContaining({
            productId: product.id,
            quantity: 2,
            subtotal: '1998',
          }),
        ],
      }),
    });

    const orderId = checkoutResponse.body.data.id as number;

    const listResponse = await agent.get('/orders').expect(200);
    expect(listResponse.body).toEqual({
      success: true,
      data: expect.arrayContaining([
        expect.objectContaining({
          id: orderId,
          status: 'PENDING',
          total: '1998',
        }),
      ]),
    });

    const detailResponse = await agent.get(`/orders/${orderId}`).expect(200);
    expect(detailResponse.body).toEqual({
      success: true,
      data: expect.objectContaining({
        id: orderId,
        status: 'PENDING',
        total: '1998',
      }),
    });
  });

  it('fails checkout when cart is empty', async () => {
    const agent = await loginAsCustomer(app);

    const response = await agent
      .post('/orders/checkout')
      .send({ address: '123 Test Street, Ho Chi Minh City' })
      .expect(400);

    expect(response.body.message).toBe('Giỏ hàng trống');
  });

  it('fails checkout when stock becomes insufficient', async () => {
    const agent = await loginAsCustomer(app);
    const product = await getSeedProduct(prisma, 'iphone-15');

    await agent
      .post('/cart/items')
      .send({ productId: product.id, quantity: 1 })
      .expect(201);

    await setProductStock(prisma, 'iphone-15', 0);

    const response = await agent
      .post('/orders/checkout')
      .send({ address: '123 Test Street, Ho Chi Minh City' })
      .expect(400);

    expect(response.body.message).toBe('Sản phẩm không đủ hàng');
  });
});
