import { NextRequest, NextResponse } from 'next/server';
import { readUploadedFile, uploadExists } from '@/backend/utils/file-storage';
import { exec } from 'child_process';
import { promisify } from 'util';
import { mkdtemp, rm, writeFile, readFile } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';

const execAsync = promisify(exec);

// Check if pdflatex is available
async function isPdfLatexAvailable(): Promise<boolean> {
  try {
    await execAsync('which pdflatex');
    return true;
  } catch {
    return false;
  }
}

type RouteParams = {
  params: Promise<{
    fileId: string;
  }>;
}

/**
 * POST /api/files/[fileId]/pdf - Generate PDF from LaTeX file
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  let tempDir: string | null = null;
  
  try {
    const { fileId } = await params;
    
    // Check if upload exists
    const exists = await uploadExists(fileId);
    if (!exists) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Read the LaTeX file
    const texContent = await readUploadedFile(fileId, 'file_clone.tex');
    if (!texContent) {
      return NextResponse.json(
        { error: 'LaTeX file not found' },
        { status: 404 }
      );
    }

    // Create temporary directory
    tempDir = await mkdtemp(path.join(tmpdir(), 'latex-'));
    const texPath = path.join(tempDir, 'document.tex');
    const pdfPath = path.join(tempDir, 'document.pdf');

    // Write LaTeX content to temp file
    await writeFile(texPath, texContent);

    // Check if pdflatex is available
    const hasLatex = await isPdfLatexAvailable();
    
    if (!hasLatex) {
      // Return a message that PDF generation requires LaTeX
      return NextResponse.json(
        { 
          error: 'PDF generation requires LaTeX to be installed on the server. Please install a LaTeX distribution (e.g., TeX Live, MiKTeX) to enable PDF generation.',
          texContent: texContent.toString() // Send the TeX content so client can handle it differently if needed
        },
        { status: 501 } // Not Implemented
      );
    }

    // Run pdflatex to generate PDF
    try {
      // Run pdflatex twice to resolve references
      await execAsync(
        `cd "${tempDir}" && pdflatex -interaction=nonstopmode -halt-on-error document.tex`,
        { timeout: 30000 } // 30 second timeout
      );
      
      // Run again for references
      await execAsync(
        `cd "${tempDir}" && pdflatex -interaction=nonstopmode -halt-on-error document.tex`,
        { timeout: 30000 }
      );
    } catch (error) {
      console.error('LaTeX compilation error:', error);
      
      // Try to read the log file for better error messages
      let logContent = '';
      try {
        const logPath = path.join(tempDir, 'document.log');
        logContent = (await readFile(logPath, 'utf-8')).slice(-1000); // Last 1000 chars
      } catch {
        // Ignore if log file can't be read
      }
      
      return NextResponse.json(
        { 
          error: 'PDF generation failed. Make sure the LaTeX file is valid.',
          details: logContent 
        },
        { status: 500 }
      );
    }

    // Read the generated PDF
    const pdfContent = await readFile(pdfPath);

    // Clean up temp directory
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }

    // Return PDF with appropriate headers
    const response = new NextResponse(pdfContent as unknown as BodyInit);
    response.headers.set('Content-Type', 'application/pdf');
    response.headers.set('Content-Disposition', 'attachment; filename="homework.pdf"');
    
    return response;
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Clean up temp directory on error
    if (tempDir) {
      try {
        await rm(tempDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}