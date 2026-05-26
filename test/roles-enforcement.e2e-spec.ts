import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { closeE2EApp, createE2EApp } from './e2e-app';
import {
  ensureAdminAndCustomer,
  loginAsAdmin,
  loginAsCustomer,
  resetCustomerState,
} from './e2e-helpers';

describe('Roles Enforcement E2E', () => {
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
    await closeE2EApp(app);
  });

  describe('CartController Roles', () => {
    it('allows CUSTOMER to access cart', async () => {
      const agent = await loginAsCustomer(app);
      await agent.get('/cart').expect(200);
    });

    it('forbids ADMIN from accessing cart', async () => {
      const agent = await loginAsAdmin(app);
      await agent.get('/cart').expect(403);
    });
  });

  describe('OrdersController Roles', () => {
    it('allows CUSTOMER to access orders', async () => {
      const agent = await loginAsCustomer(app);
      await agent.get('/orders').expect(200);
    });

    it('forbids ADMIN from accessing orders', async () => {
      const agent = await loginAsAdmin(app);
      await agent.get('/orders').expect(403);
    });
  });
});
