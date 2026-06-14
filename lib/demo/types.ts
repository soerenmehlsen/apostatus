import { SessionStatus, CheckStatus } from "@/types/api";

export interface DemoSession {
  id: string;
  name: string;
  status: SessionStatus;
  createdAt: string; // ISO
  createdBy: string;
}

export interface DemoFile {
  id: string;
  filename: string;
  uploadDate: string; // ISO
  location: string;
  productCount: number;
  stocktakeSessionId: string | null;
}

export interface DemoProduct {
  id: string;
  fileId: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  location: string;
  expectedQty: number;
}

export interface DemoCheck {
  id: string;
  productId: string;
  sessionId: string;
  expectedQty: number;
  countedQty: number;
  variance: number;
  checkedAt: string; // ISO
  checkedBy: string;
  status: CheckStatus;
  reason: string | null;
}

export interface DemoState {
  sessions: DemoSession[];
  files: DemoFile[];
  products: DemoProduct[];
  checks: DemoCheck[];
}
