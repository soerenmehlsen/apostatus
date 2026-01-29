//import { NextRequest } from 'next/server';
import { db as prisma } from '@/lib/db';
import { createSessionSchema } from '@/lib/validations/session';
import { ApiResponseBuilder } from '@/lib/api-response';
import { withValidation, withErrorHandling } from '@/lib/api-middleware';

export const POST = withErrorHandling(
  withValidation(createSessionSchema)(async (request) => {
    const { name, locations, createdBy } = request.validatedData;

    // Create a new stocktake session
    const session = await prisma.stocktakeSession.create({
      data: {
        name: `Stocktake - ${name}`,
        status: 'In Progress',
        createdBy: createdBy,
        createdAt: new Date(),
      },
    });

    console.log('Created stocktake session:', session.id);

    // Link uploaded files to this session for the selected locations
    console.log('Linking files for locations:', locations);
    console.log('Session ID:', session.id);

    // First, check what files exist for these locations
    const existingFiles = await prisma.uploadedFile.findMany({
      where: {
        location: {
          in: locations
        }
      },
      select: {
        id: true,
        location: true,
        stocktakeSessionId: true
      }
    });
    console.log('Existing files for locations:', existingFiles);

    const updatedFiles = await prisma.uploadedFile.updateMany({
      where: {
        location: {
          in: locations
        },
        stocktakeSessionId: null // Only update files not already linked to a session
      },
      data: {
        stocktakeSessionId: session.id
      }
    });
    console.log('Updated files count:', updatedFiles.count);

    return ApiResponseBuilder.success(
      {
        sessionId: session.id,
        linkedFiles: updatedFiles.count
      },
      'Stocktake session created successfully',
      201
    );
  })
);