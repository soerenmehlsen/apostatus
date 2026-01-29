// API Response Types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: ValidationError[];
  success: false;
  timestamp: string;
}

// Database Model Types (matching Prisma schema)
export interface StocktakeSession {
  id: string;
  name: string;
  status: SessionStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  stockChecks?: StockCheck[];
  uploadedFiles?: UploadedFile[];
}

export interface UploadedFile {
  id: string;
  filename: string;
  uploadDate: Date;
  location: string;
  productCount: number;
  stocktakeSessionId: string | null;
  products?: Product[];
  stocktakeSession?: StocktakeSession;
}

export interface Product {
  id: string;
  fileId: string;
  name: string;
  sku: string | null;
  quantity: number | null;
  price: number | null;
  location: string | null;
  expectedQty: number | null;
  countedQty: number | null;
  variance: number | null;
  file?: UploadedFile;
  stockChecks?: StockCheck[];
}

export interface StockCheck {
  id: string;
  productId: string;
  sessionId: string;
  expectedQty: number;
  countedQty: number;
  variance: number;
  checkedAt: Date;
  checkedBy: string | null;
  status: CheckStatus;
  product?: Product;
  session?: StocktakeSession;
}

// Enums
export type SessionStatus = 'In Progress' | 'Review' | 'Completed';
export type CheckStatus = 'Pending' | 'Completed' | 'Needs Review';

// Location mapping
export interface Location {
  id: string;
  name: string;
}

export const LOCATION_MAP: Record<string, string> = {
  '101': 'Main Floor',
  '102': 'Back Storage',
  '103': 'Refrigerator',
  '104': 'Controlled Substances',
  '105': 'OTC Section',
  '111': 'Emergency Kit'
} as const;