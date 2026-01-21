import { z } from 'zod';

/**
 * UUID schema
 */
export const uuidSchema = z.string().uuid();

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

/**
 * Sort schema
 */
export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc');

