import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    phoneNumber: z.string().min(10),
    faydaId: z.string().length(10),
  }),
});

export const updateMemberStatusSchema = z.object({
  body: z.object({
    status: z.enum(['active', 'pending', 'suspended', 'rejected']),
  }),
  params: z.object({
    uid: z.string().uuid(),
  }),
});

export const createPaymentSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    currency: z.string().default('ETB'),
    method: z.enum(['telebirr', 'manual', 'bank']),
    transactionId: z.string().optional(),
  }),
});
