import { z } from "zod";

// Product validation
export const createProductSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(100),
    description: z.string().min(10, "Description must be at least 10 characters").max(5000),
    price: z.number().positive("Price must be positive").max(10000000),
    quantity: z.number().positive("Quantity must be positive").max(1000000),
    unit: z.enum(["kg", "quintal", "ton", "piece", "liter"]),
    category: z.enum(["grains", "coffee", "honey", "spices", "fruits", "vegetables", "livestock", "dairy", "tech"]),
    location: z.string().min(2).max(100),
    images: z.array(z.string().url()).max(5).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

// Order validation
export const createOrderSchema = z.object({
    productId: z.string().cuid("Invalid product ID"),
    quantity: z.number().positive("Quantity must be positive").max(100000),
    deliveryAddress: z.string().min(10, "Address must be at least 10 characters").max(500),
    paymentMethod: z.enum(["chapa", "telebirr", "cbe_birr", "wallet"]),
    notes: z.string().max(1000).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// Payment validation
export const initiatePaymentSchema = z.object({
    orderId: z.string().cuid("Invalid order ID"),
    amount: z.number().positive("Amount must be positive").max(100000000),
    provider: z.enum(["chapa", "telebirr", "cbe_birr"]),
});

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;

// User registration validation
export const registerUserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters").max(100),
    role: z.enum(["FARMER", "BUYER", "TRANSPORTER", "STORAGE_PROVIDER", "EDUCATOR", "ADMIN"]),
    phone: z.string().optional(),
    location: z.string().optional(),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;

// Transportation request validation
export const createTransportRequestSchema = z.object({
    pickupLocation: z.string().min(5, "Pickup location required").max(200),
    deliveryLocation: z.string().min(5, "Delivery location required").max(200),
    cargoType: z.string().min(2).max(100),
    weight: z.number().positive("Weight must be positive").max(100000),
    pickupDate: z.string().datetime("Invalid date format"),
    notes: z.string().max(1000).optional(),
});

export type CreateTransportRequestInput = z.infer<typeof createTransportRequestSchema>;

// Storage booking validation
export const createStorageBookingSchema = z.object({
    facilityId: z.string().cuid("Invalid facility ID"),
    productType: z.string().min(2).max(100),
    quantity: z.number().positive("Quantity must be positive").max(1000000),
    unit: z.enum(["kg", "quintal", "ton"]),
    startDate: z.string().datetime("Invalid start date"),
    endDate: z.string().datetime("Invalid end date"),
    notes: z.string().max(1000).optional(),
});

export type CreateStorageBookingInput = z.infer<typeof createStorageBookingSchema>;

// Learning enrollment validation
export const createEnrollmentSchema = z.object({
    courseId: z.string().cuid("Invalid course ID"),
    paymentMethod: z.enum(["chapa", "telebirr", "cbe_birr", "wallet"]).optional(),
});

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;

// Consultation booking validation
export const createConsultationSchema = z.object({
    expertId: z.string().cuid("Invalid expert ID"),
    topic: z.string().min(5, "Topic must be at least 5 characters").max(200),
    preferredDate: z.string().datetime("Invalid date format"),
    duration: z.number().positive("Duration must be positive").max(240), // in minutes
    notes: z.string().max(1000).optional(),
});

export type CreateConsultationInput = z.infer<typeof createConsultationSchema>;
