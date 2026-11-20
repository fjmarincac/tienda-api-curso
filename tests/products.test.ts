import { describe, expect, it } from 'vitest';
import { api, createProduct } from './helpers.ts';

describe('GET /api/products', () => {
  it('devuelve el catálogo completo', async () => {
    const res = await api().get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(8);
    expect(res.body[0]).toEqual({
      id: 1,
      name: 'Teclado mecánico',
      category: 'electronica',
      priceCents: 8990,
      stock: 12,
    });
  });

  it('filtra por categoría', async () => {
    const res = await api().get('/api/products?category=hogar');

    expect(res.status).toBe(200);
    expect(res.body.map((p: { id: number }) => p.id)).toEqual([6, 7]);
  });

  it('devuelve una lista vacía si la categoría no tiene productos', async () => {
    const res = await api().get('/api/products?category=jardin');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('filtra por precio máximo, incluido el propio límite', async () => {
    createProduct({ priceCents: 3000 });

    const res = await api().get('/api/products?maxPriceCents=3000');

    expect(res.status).toBe(200);
    expect(res.body.map((p: { priceCents: number }) => p.priceCents)).toEqual([
      2495, 1295, 790, 995, 3000,
    ]);
  });

  it('combina los dos filtros', async () => {
    const res = await api().get('/api/products?category=hogar&maxPriceCents=3000');

    expect(res.status).toBe(200);
    expect(res.body.map((p: { id: number }) => p.id)).toEqual([6]);
  });

  it.each([
    ['un precio que no es un número', 'maxPriceCents=abc'],
    ['un precio negativo', 'maxPriceCents=-1'],
    ['un precio con decimales', 'maxPriceCents=12.5'],
    ['un precio vacío', 'maxPriceCents='],
    ['una categoría vacía', 'category='],
    ['una categoría repetida', 'category=hogar&category=libros'],
  ])('responde 400 con %s', async (_caso, query) => {
    const res = await api().get(`/api/products?${query}`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /api/products/:id', () => {
  it('devuelve el producto', async () => {
    const res = await api().get('/api/products/4');

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Cuaderno A5 de tapa dura');
  });

  it('responde 404 si no existe', async () => {
    const res = await api().get('/api/products/999');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('PRODUCT_NOT_FOUND');
  });

  it('responde 400 si el id no es un número', async () => {
    const res = await api().get('/api/products/abc');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
