"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FileContextType {
  fileId: string | null;
  setFileId: (id: string | null) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fileId, setFileId] = useState<string | null>(null);

  return (
    <FileContext.Provider value={{ fileId, setFileId }}>
      {children}
    </FileContext.Provider>
  );
};

export const useFile = () => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFile must be used within a FileProvider');
  }
  return context;
};