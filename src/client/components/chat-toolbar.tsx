"use client";

import { Button } from "@/components/ui/button";
import { useFile } from "@/contexts/file-context";
import { useState } from "react";

export function ChatToolbar() {
  const { fileId } = useFile();
  const [isDownloadingTex, setIsDownloadingTex] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const handleDownloadTex = async () => {
    if (!fileId) return;
    
    setIsDownloadingTex(true);
    try {
      const response = await fetch(`/api/files/${fileId}?filename=file_clone.tex`);
      if (!response.ok) {
        throw new Error("Failed to download .tex file");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "homework.tex";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading .tex file:", error);
    } finally {
      setIsDownloadingTex(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!fileId) return;
    
    setIsDownloadingPdf(true);
    setPdfError(null);
    try {
      const response = await fetch(`/api/files/${fileId}/pdf`, {
        method: "POST",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate PDF");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "homework.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setPdfError(error instanceof Error ? error.message : "Failed to generate PDF");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (!fileId) {
    return null;
  }

  return (
    <div className="h-8 flex items-center gap-2 px-4 border-b bg-background" style={{ height: '32px', minHeight: '32px', maxHeight: '32px' }}>
      <div className="flex items-center gap-2 ml-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownloadTex}
          disabled={isDownloadingTex}
          className="h-6 text-xs"
        >
          {isDownloadingTex ? "Downloading..." : ".tex file"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownloadPdf}
          disabled={isDownloadingPdf}
          className="h-6 text-xs"
        >
          {isDownloadingPdf ? "Generating..." : ".pdf"}
        </Button>
      </div>
      {pdfError && (
        <span className="text-xs text-destructive ml-2">{pdfError}</span>
      )}
    </div>
  );
}