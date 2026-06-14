import { z } from 'zod';

export const createSessionSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  locations: z.array(z.string())
    .min(1, 'At least one location is required')
    .max(20, 'Too many locations selected'),
});

export const sessionIdSchema = z.object({
  sessionId: z.string().cuid('Invalid session ID format')
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type SessionIdInput = z.infer<typeof sessionIdSchema>;