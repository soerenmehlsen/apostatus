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
  '101': 'Hovedetage',
  '102': 'Baglager',
  '103': 'Køleskab',
  '104': 'Mærkevarer',
  '105': 'Mærkevarer',
  '106': 'Mærkevarer',
  '107': 'Mærkevarer',
  '108': 'Mærkevarer',
  '109': 'Mærkevarer',
  '110': 'Mærkevarer',
  '111': 'Mærkevarer'
} as const;

// Faste årsager til lagerafvigelse. Kode gemmes på StockCheck.reason; label vises i UI.
export const VARIANCE_REASON_MAP: Record<string, string> = {
  shrinkage: 'Svind/tyveri',
  disposal: 'Kassation (udløbet/beskadiget)',
  registration_error: 'Registreringsfejl',
  delivery_error: 'Fejl i levering',
} as const;

// Bevarer rækkefølgen til dropdown-visning.
export const VARIANCE_REASONS: { code: string; label: string }[] = Object.entries(
  VARIANCE_REASON_MAP
).map(([code, label]) => ({ code, label }));