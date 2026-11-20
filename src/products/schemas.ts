import { z } from 'zod';

/** Filtros opcionales de `GET /api/products`. Los parámetros de la query llegan como texto. */
export const listProductsQuerySchema = z.object({
  category: z.string().trim().min(1).optional(),
  // Solo dígitos: `z.coerce` aceptaría '' (→ 0) o '12.5'
  maxPriceCents: z
    .string()
    .regex(/^\d+$/, 'Debe ser un número entero de céntimos, 0 o mayor')
    .transform(Number)
    .optional(),
});

export type ProductFilters = z.output<typeof listProductsQuerySchema>;
