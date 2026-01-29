import { z } from "zod";

// Dashboard API validation
export const DashboardRequestSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

// Stocktake session validation
export const StocktakeSessionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  status: z.enum(["In Progress", "Review", "Completed"]),
  location: z.string().min(1, "Location is required"),
});

// Product validation
export const ProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Product name is required"),
  sku: z.string().optional(),
  quantity: z.number().int().min(0).optional(),
  price: z.number().positive().optional(),
  location: z.string().optional(),
  expectedQty: z.number().int().min(0).optional(),
  countedQty: z.number().int().min(0).optional(),
});

// Stock check validation
export const StockCheckSchema = z.object({
  productId: z.string().min(1),
  sessionId: z.string().min(1),
  expectedQty: z.number().int().min(0),
  countedQty: z.number().int().min(0),
  checkedBy: z.string().optional(),
});

// File upload validation
export const FileUploadSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  location: z.string().min(1, "Location is required"),
  productCount: z.number().int().min(0).default(0),
});

// Environment validation
export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
});

// Type exports for TypeScript
export type DashboardRequest = z.infer<typeof DashboardRequestSchema>;
export type StocktakeSession = z.infer<typeof StocktakeSessionSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type StockCheck = z.infer<typeof StockCheckSchema>;
export type FileUpload = z.infer<typeof FileUploadSchema>;