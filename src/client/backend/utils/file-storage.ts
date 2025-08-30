import { readFile, readdir, stat } from 'fs/promises';
import path from 'path';

// Base storage directory path
export const STORAGE_BASE_PATH = path.join(process.cwd(), 'src', 'backend', 'storage');

/**
 * Get the directory path for a specific file upload
 */
export function getUploadDirectory(fileId: string): string {
  return path.join(STORAGE_BASE_PATH, fileId);
}

/**
 * Get all files in an upload directory
 */
export async function getUploadedFiles(fileId: string): Promise<string[]> {
  try {
    const uploadDir = getUploadDirectory(fileId);
    const files = await readdir(uploadDir);
    return files;
  } catch (error) {
    console.error(`Error reading upload directory for ${fileId}:`, error);
    return [];
  }
}

/**
 * Read a specific file from an upload directory
 */
export async function readUploadedFile(fileId: string, filename: string): Promise<Buffer | null> {
  try {
    const filePath = path.join(getUploadDirectory(fileId), filename);
    const content = await readFile(filePath);
    return content;
  } catch (error) {
    console.error(`Error reading file ${filename} for upload ${fileId}:`, error);
    return null;
  }
}

/**
 * Check if an upload exists
 */
export async function uploadExists(fileId: string): Promise<boolean> {
  try {
    const uploadDir = getUploadDirectory(fileId);
    const stats = await stat(uploadDir);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(fileId: string, filename: string) {
  try {
    const filePath = path.join(getUploadDirectory(fileId), filename);
    const stats = await stat(filePath);
    return {
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
    };
  } catch (error) {
    console.error(`Error getting file metadata for ${filename}:`, error);
    return null;
  }
}