// End-to-end tests of the HTTP API against a real MongoDB.
// They only run when MONGO_URL_TEST points to a throwaway database, e.g.:
//   docker run -d --rm --name logiboutik-test-mongo -p 27018:27017 mongo:3.6
//   MONGO_URL_TEST=mongodb://localhost:27018/logiboutik-test pnpm test
// The database is wiped before every test: never point it at real data.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../src/app';
import { connectDatabase, disconnectDatabase } from '../src/database';

const url = process.env.MONGO_URL_TEST;
const app = createApp(['http://localhost:3000']);

async function createShop(name = 'shop') {
  await request(app).post('/shop').send({ name }).expect(200);
  return (await request(app).get('/shop')).body.find(
    (s: { name: string }) => s.name === name,
  )._id as string;
}

async function createArticle(shop: string, name = 'pot', price: unknown = 10) {
  await request(app).post('/article').send({ name, price, shop }).expect(200);
  return (await request(app).get('/article')).body.find(
    (a: { name: string }) => a.name === name,
  )._id as string;
}

function move(
  article: string,
  transaction_type: string,
  quantity: number,
  date: string,
) {
  return request(app)
    .post('/transaction')
    .send({ article, transaction_type, quantity, date });
}

describe.skipIf(!url)('API', () => {
  beforeAll(async () => {
    await connectDatabase(url as string);
  });
  beforeEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });
  afterAll(async () => {
    await disconnectDatabase();
  });

  it('creates, reads, updates and deletes an article', async () => {
    const shop = await createShop();
    const id = await createArticle(shop, 'pot', '12,5');

    const read = await request(app).get(`/article/${id}`).expect(200);
    expect(read.body.details.price).toBe(12.5);
    expect(read.body.stock).toBe(0);

    await request(app)
      .post(`/article/${id}`)
      .send({ name: 'vase', price: 3, shop })
      .expect(200);
    expect((await request(app).get(`/article/${id}`)).body.details.name).toBe(
      'vase',
    );

    await request(app).delete(`/article/${id}`).expect(200);
    await request(app).get(`/article/${id}`).expect(404);
  });

  it('answers 400/404/409 instead of 500 on bad requests', async () => {
    const shop = await createShop();
    await createArticle(shop);

    const missing = await request(app).post('/article').send({ name: 'x' });
    expect(missing.status).toBe(400);
    expect(missing.body.code).toBe('invalid_input');

    const duplicate = await request(app)
      .post('/article')
      .send({ name: 'pot', price: 1, shop });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.code).toBe('article_exists');

    await request(app).get('/article/not-an-id').expect(404);
    await request(app).get('/shop/5f1d7f5e9c1a2b3c4d5e6f70').expect(404);
    await request(app).get('/income').expect(400);
  });

  it('refuses to delete a shop that still has articles', async () => {
    const shop = await createShop();
    const article = await createArticle(shop);

    const res = await request(app).delete(`/shop/${shop}`);
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('shop_has_articles');

    await request(app).delete(`/article/${article}`).expect(200);
    await request(app).delete(`/shop/${shop}`).expect(200);
  });

  it('rejects the day/month date and translated type sent by the old edit page', async () => {
    const shop = await createShop();
    const article = await createArticle(shop);
    await move(article, 'deposite', 5, '2024-03-05T23:00:00.000Z').expect(200);
    const id = (await request(app).get('/transaction')).body[0]._id;

    await request(app)
      .post(`/transaction/${id}`)
      .send({
        article,
        transaction_type: 'Déposé',
        quantity: 5,
        date: '05/03/2024',
      })
      .expect(400);

    const [stored] = (await request(app).get(`/transaction/${id}`)).body;
    expect(stored.transaction_type).toBe('deposite');
    expect(stored.date).toBe('2024-03-05T23:00:00.000Z');
  });

  it('computes stock, income and dashboard totals', async () => {
    const shop = await createShop();
    const pot = await createArticle(shop, 'pot', 10);
    const vase = await createArticle(shop, 'vase', 2.5);

    await move(pot, 'deposite', 10, '2024-01-01T00:00:00.000Z').expect(200);
    await move(vase, 'deposite', 4, '2024-01-01T00:00:00.000Z').expect(200);
    await move(pot, 'sell', 3, '2024-01-15T10:00:00.000Z').expect(200);
    await move(vase, 'sell', 4, '2024-01-31T22:00:00.000Z').expect(200);
    await move(pot, 'retrieve', 1, '2024-02-01T10:00:00.000Z').expect(200);
    await move(pot, 'sell', 1, '2024-02-02T10:00:00.000Z').expect(200);

    const stock = await request(app).get('/stock').expect(200);
    expect(stock.body).toEqual([{ name: 'pot', price: 10, quantity: 5 }]);

    // [start, end): a sale late on the last day is included
    const january = await request(app)
      .get('/income')
      .query({ startDate: '2024-01-01', endDate: '2024-02-01' })
      .expect(200);
    expect(january.body).toEqual([
      { name: 'pot', price: 10, quantity: 3 },
      { name: 'vase', price: 2.5, quantity: 4 },
    ]);

    expect((await request(app).get('/dashboard/sell')).body).toBe(8);
    expect((await request(app).get('/dashboard/income')).body).toBe(50);
  });

  it('ignores transactions whose article no longer exists', async () => {
    const shop = await createShop();
    const pot = await createArticle(shop, 'pot', 10);
    await move(pot, 'deposite', 2, '2024-01-01T00:00:00.000Z').expect(200);
    // An orphan left by an old version of the app
    await mongoose.connection.db.collection('transactions').insertOne({
      article: new mongoose.Types.ObjectId(),
      transaction_type: 'deposite',
      quantity: 7,
      date: new Date('2024-01-01'),
    });

    await request(app).get('/transaction').expect(200);
    const stock = await request(app).get('/stock').expect(200);
    expect(stock.body).toEqual([{ name: 'pot', price: 10, quantity: 2 }]);
  });

  it('exports every collection in the backup', async () => {
    await createShop('boutique');
    const backup = await request(app).get('/backup').expect(200);
    expect(backup.body.meta.collections).toContain('shops');
    expect(backup.body.data.shops[0].name).toBe('boutique');
  });
});
