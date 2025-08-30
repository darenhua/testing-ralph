# Backend Storage System

This directory contains the backend storage system for the math homework assistant app.

## Directory Structure

```
backend/
├── storage/           # File storage directory (git-ignored)
│   └── {fileId}/     # Each upload gets a unique directory
│       ├── original.tex    # Original uploaded file
│       └── file_clone.tex  # Clone of the uploaded file
├── types/            # TypeScript type definitions
└── utils/            # Utility functions for file operations
```

## API Endpoints

### POST /api/upload
Upload a .tex file to the server.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: FormData with 'file' field containing the .tex file

**Response:**
```json
{
  "id": "unique-file-id",
  "success": true
}
```

**Error Response:**
```json
{
  "id": "",
  "success": false,
  "error": "Error message"
}
```

**Validation:**
- Only .tex files are allowed
- Maximum file size: 10MB

### GET /api/files/[fileId]
Get information about an uploaded file.

**Response:**
```json
{
  "id": "file-id",
  "files": ["original-filename.tex", "file_clone.tex"],
  "success": true
}
```

### GET /api/files/[fileId]?filename=file_clone.tex
Download a specific file from an upload.

**Response:**
- Content-Type: `text/plain; charset=utf-8`
- Content-Disposition: `attachment; filename="file_clone.tex"`
- Body: File contents

## Storage Details

- Each upload is stored in a unique directory identified by a UUID
- Both the original file and a clone (`file_clone.tex`) are saved
- Files are stored in `src/backend/storage/` which is git-ignored
- The storage directory is automatically created if it doesn't exist

## Security Considerations

- File type validation (only .tex files)
- File size validation (10MB limit)
- Unique IDs prevent directory traversal attacks
- No direct file system access from client