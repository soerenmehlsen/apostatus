import { NextRequest, NextResponse } from 'next/server';
import { parseCSV, ProductData } from '@/lib/csv-parser';
import { db as prisma } from '@/lib/db';


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
      
      // Save to database
      try {
        // Create the uploaded file record
        const uploadedFile = await prisma.uploadedFile.create({
          data: {
            filename: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for display
            uploadDate: new Date(),
            location: location,
            productCount: products.length, // Link to session if provided
            products: {
              create: products.map((product: ProductData) => ({
                name: product.navn,
                sku: product.varenr,
                quantity: product.antal,
                price: product.kostpris,
                location: product.location,
                expectedQty: product.antal, // Set expected = imported quantity initially
                // countedQty and variance will be null until stock check is performed
              }))
            }
          },
          include: {
            products: true,
          }
        });

        results.push({
          id: uploadedFile.id,
          filename: uploadedFile.filename,
          location: uploadedFile.location,
          productCount: uploadedFile.productCount,
          uploadDate: uploadedFile.uploadDate.toISOString()
        });

      } catch (dbError) {
        console.error('Database error:', dbError);
        return NextResponse.json(
          { error: `Failed to save data to database: ${dbError}` },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      files: results,
      message: `Successfully uploaded ${files.length} file(s) and saved ${results.reduce((sum, r) => sum + r.productCount, 0)} products to database`
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
  try {
    // Only fetch essential file data without products (use productCount instead)
    const files = await prisma.uploadedFile.findMany({
      select: {
        id: true,
        filename: true,
        uploadDate: true,
        location: true,
        productCount: true,
        stocktakeSessionId: true
      },
      orderBy: {
        uploadDate: 'desc'
      }
    });

    const formattedFiles = files.map(file => ({
      id: file.id,
      filename: file.filename,
      uploadDate: file.uploadDate.toISOString(),
      location: file.location,
      productCount: file.productCount,
    }));

    return NextResponse.json({ files: formattedFiles });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('id');
    
    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 });
    }
    
    // Delete the file and all related products (cascade delete)
    await prisma.uploadedFile.delete({
      where: { id: fileId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}