import { z } from 'zod';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

export const uploadFileSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, 'File size must be less than 10MB')
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type),
      'File must be a CSV or Excel file'
    ),
  location: z.string()
    .min(1, 'Location is required')
    .max(10, 'Location code must be less than 10 characters')
});

export const uploadMetadataSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  location: z.string().min(1, 'Location is required'),
  productCount: z.number().int().min(0, 'Product count must be non-negative')
});

export type UploadFileInput = z.infer<typeof uploadFileSchema>;
export type UploadMetadataInput = z.infer<typeof uploadMetadataSchema>;