"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import type { FileUploadResponse } from '@/types/file-upload';

interface FileUploadProps {
  onFileUploaded: (fileId: string) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
    setError(null);

    if (fileRejections.length > 0) {
      setError('Please upload only .tex files');
      return;
    }

    if (acceptedFiles.length === 0) {
      return;
    }

    const file = acceptedFiles[0];
    setUploadingFile(file);
    setIsProcessing(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload file to backend
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result: FileUploadResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // File uploaded successfully
      
      onFileUploaded(result.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file. Please try again.';
      setError(errorMessage);
      console.error('Upload error:', err);
    } finally {
      setIsProcessing(false);
      setUploadingFile(null);
    }
  }, [onFileUploaded]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/x-tex': ['.tex'],
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="w-full max-w-2xl px-4">
        <div
          {...getRootProps()}
          className={`
            relative cursor-pointer rounded-lg border-2 border-dashed p-16 text-center transition-all duration-200
            ${isDragActive && !isDragReject ? 'border-primary bg-primary/5' : ''}
            ${isDragReject ? 'border-destructive bg-destructive/5' : ''}
            ${!isDragActive && !isDragReject ? 'border-muted-foreground/25 hover:border-muted-foreground/50' : ''}
            ${isProcessing ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {isProcessing ? (
            <div className="space-y-4">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <h3 className="text-xl font-semibold">Processing your file...</h3>
              {uploadingFile && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">{uploadingFile.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(uploadingFile.size)}</p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">Please wait while we prepare your homework</p>
            </div>
          ) : isDragActive && !isDragReject ? (
            <div className="space-y-4">
              <svg
                className="mx-auto h-12 w-12 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <h3 className="text-xl font-semibold">Drop your file here</h3>
              <p className="text-sm text-muted-foreground">Release to upload</p>
            </div>
          ) : isDragReject ? (
            <div className="space-y-4">
              <svg
                className="mx-auto h-12 w-12 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-destructive">Invalid file type</h3>
              <p className="text-sm text-muted-foreground">Only .tex files are accepted</p>
            </div>
          ) : (
            <div className="space-y-4">
              <svg
                className="mx-auto h-12 w-12 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <h3 className="text-2xl font-semibold">Upload your math homework</h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop your file here, or click to select
              </p>
              <p className="text-xs text-muted-foreground">Accepted file types: .tex</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};