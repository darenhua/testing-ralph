import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import type { FileUploadResponse } from '@/types/file-upload';

// Base storage directory path
const STORAGE_BASE_PATH = path.join(process.cwd(), 'src', 'backend', 'storage');

// Configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.tex'];

export async function POST(request: NextRequest) {
  try {
    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Validate file exists
    if (!file) {
      return NextResponse.json<FileUploadResponse>(
        {
          id: '',
          success: false,
          error: 'No file provided',
        },
        { status: 400 }
      );
    }

    // Validate file type
    const fileExtension = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json<FileUploadResponse>(
        {
          id: '',
          success: false,
          error: `Only ${ALLOWED_EXTENSIONS.join(', ')} files are allowed`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json<FileUploadResponse>(
        {
          id: '',
          success: false,
          error: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        },
        { status: 400 }
      );
    }

    // Generate unique ID for this upload
    const fileId = randomUUID();
    
    // Create directory path for this upload
    const uploadDir = path.join(STORAGE_BASE_PATH, fileId);
    
    // Ensure the directory exists
    await mkdir(uploadDir, { recursive: true });

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save the original file
    const originalFilePath = path.join(uploadDir, file.name);
    await writeFile(originalFilePath, buffer);

    // Create and save the clone file
    const cloneFilePath = path.join(uploadDir, 'file_clone.tex');
    await writeFile(cloneFilePath, buffer);

    // Return success response with file ID
    return NextResponse.json<FileUploadResponse>({
      id: fileId,
      success: true,
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    
    return NextResponse.json<FileUploadResponse>(
      {
        id: '',
        success: false,
        error: 'Failed to upload file',
      },
      { status: 500 }
    );
  }
}