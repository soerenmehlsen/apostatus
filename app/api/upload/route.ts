import { NextRequest, NextResponse } from 'next/server';
import { parseCSV, ProductData } from '@/lib/csv-parser';

// A simple in-memory storage for uploaded files
let uploadedFiles: Array<{
  id: string;
  filename: string;
  uploadDate: string;
  location: string;
  products: ProductData[];
}> = [];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    const results = [];
    
    for (const file of files) {
      if (!file.name.endsWith('.csv')) {
        return NextResponse.json(
          { error: `File ${file.name} is not a CSV file` },
          { status: 400 }
        );
      }
      
      const content = await file.text();
      const products = parseCSV(content);
      
      // Extract location from first product (assuming all products in file have same location)
      const location = products.length > 0 ? products[0].location : 'Unknown';
      
      const fileData = {
        id: crypto.randomUUID(),
        filename: file.name,
        uploadDate: new Date().toISOString(),
        location: location,
        products: products
      };
      
      uploadedFiles.push(fileData);
      results.push({
        filename: file.name,
        location: location,
        productCount: products.length
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      files: results,
      message: `Successfully uploaded ${files.length} file(s)`
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ files: uploadedFiles });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('id');
  
  if (!fileId) {
    return NextResponse.json({ error: 'File ID required' }, { status: 400 });
  }
  
  uploadedFiles = uploadedFiles.filter(file => file.id !== fileId);
  
  return NextResponse.json({ success: true });
}