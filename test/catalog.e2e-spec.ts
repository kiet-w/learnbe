import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createE2EApp, closeE2EApp } from './e2e-app';

describe('Catalog E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const setup = await createE2EApp();
    app = setup.app;
  });

  afterAll(async () => {
    await closeE2EApp(app);
  });

  it('GET / returns the root response', async () => {
    await request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('GET /categories returns seeded categories', async () => {
    const response = await request(app.getHttpServer())
      .get('/categories')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: 'phones',
          name: 'Phones',
        }),
        expect.objectContaining({
          slug: 'laptops',
          name: 'Laptops',
        }),
      ]),
    );
  });

  it('GET /products returns paginated catalog', async () => {
    const response = await request(app.getHttpServer())
      .get('/products')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.meta).toEqual(
      expect.objectContaining({
        page: 1,
        limit: 10,
      }),
    );
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0]).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        slug: expect.any(String),
        category: expect.objectContaining({
          id: expect.any(Number),
          slug: expect.any(String),
        }),
      }),
    );
  });

  it('GET /products/:slug returns product detail', async () => {
    const response = await request(app.getHttpServer())
      .get('/products/iphone-15')
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      data: expect.objectContaining({
        slug: 'iphone-15',
        name: 'iPhone 15',
        price: '999',
        stock: expect.any(Number),
        images: expect.arrayContaining([
          expect.objectContaining({
            url: 'https://example.com/images/iphone-15.jpg',
          }),
        ]),
      }),
    });
  });
});
