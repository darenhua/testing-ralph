"use client";

import { Assistant } from "./assistant";
import { FileUpload } from "@/components/file-upload";
import { useFile } from "@/contexts/file-context";

export default function Home() {
  const { fileId, setFileId } = useFile();

  const handleFileUploaded = (uploadedFileId: string) => {
    setFileId(uploadedFileId);
  };

  if (!fileId) {
    return <FileUpload onFileUploaded={handleFileUploaded} />;
  }

  return <Assistant />;
}
