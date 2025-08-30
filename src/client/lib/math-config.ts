// Configuration for math homework features
export const mathConfig = {
  // KaTeX options for rendering math expressions
  katexOptions: {
    strict: false,
    throwOnError: false,
    macros: {
      '\\R': '\\mathbb{R}',
      '\\N': '\\mathbb{N}',
      '\\Z': '\\mathbb{Z}',
      '\\Q': '\\mathbb{Q}',
      '\\C': '\\mathbb{C}',
    },
  },
  
  // Supported file types for homework uploads
  supportedFileTypes: {
    images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
    documents: ['.pdf', '.doc', '.docx'],
    text: ['.txt', '.tex', '.md'],
  },
  
  // Maximum file size in MB
  maxFileSize: 10,
  
  // PDF export settings
  pdfExport: {
    format: 'A4',
    margin: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    },
  },
};