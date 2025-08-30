import { NextRequest, NextResponse } from 'next/server';
import { readUploadedFile, uploadExists, getUploadedFiles } from '@/../../src/backend/utils/file-storage';

type RouteParams = {
  params: Promise<{
    fileId: string;
  }>;
}

/**
 * GET /api/files/[fileId] - Get information about an uploaded file or download a specific file
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { fileId } = await params;
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    // Check if upload exists
    const exists = await uploadExists(fileId);
    if (!exists) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // If filename is provided, download the specific file
    if (filename) {
      const fileContent = await readUploadedFile(fileId, filename);
      if (!fileContent) {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        );
      }

      // Return file content with appropriate headers
      const response = new NextResponse(fileContent as any);
      response.headers.set('Content-Type', 'text/plain; charset=utf-8');
      response.headers.set('Content-Disposition', `attachment; filename="${filename}"`);
      
      return response;
    }

    // Otherwise, return list of files in the upload directory
    const files = await getUploadedFiles(fileId);
    
    return NextResponse.json({
      id: fileId,
      files: files,
      success: true,
    });
  } catch (error) {
    console.error('Error handling file request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}