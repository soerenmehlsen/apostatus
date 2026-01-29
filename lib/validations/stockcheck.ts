import { z } from 'zod';

export const saveProductSchema = z.object({
  productId: z.string().cuid('Invalid product ID'),
  sessionId: z.string().cuid('Invalid session ID'),
  countedQty: z.number()
    .int('Counted quantity must be a whole number')
    .min(0, 'Counted quantity cannot be negative')
    .max(999999, 'Counted quantity is too large'),
  checkedBy: z.string()
    .min(1, 'Checker name is required')
    .max(50, 'Checker name must be less than 50 characters')
    .optional()
});

export const completeCheckSchema = z.object({
  sessionId: z.string().cuid('Invalid session ID'),
  completedBy: z.string()
    .min(1, 'Completer name is required')
    .max(50, 'Completer name must be less than 50 characters')
    .optional()
});

export const stockDataQuerySchema = z.object({
  location: z.string().optional(),
  sessionId: z.string().cuid().optional()
});

export type SaveProductInput = z.infer<typeof saveProductSchema>;
export type CompleteCheckInput = z.infer<typeof completeCheckSchema>;
export type StockDataQuery = z.infer<typeof stockDataQuerySchema>;