/**
 * Represents metadata about a stored file
 */
export interface StoredFile {
  id: string;
  filename: string;
  size: number;
  createdAt: Date;
  modifiedAt: Date;
}

/**
 * Represents a file upload session
 */
export interface FileUploadSession {
  id: string;
  originalFilename: string;
  files: string[];
  uploadedAt: Date;
}

/**
 * File storage configuration
 */
export interface StorageConfig {
  maxFileSize: number; // in bytes
  allowedExtensions: string[];
  storageBasePath: string;
}