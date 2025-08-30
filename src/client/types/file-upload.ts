export interface UploadedFile {
  id: string;
  filename: string;
  uploadedAt: Date;
}

export interface FileUploadResponse {
  id: string;
  success: boolean;
  error?: string;
}