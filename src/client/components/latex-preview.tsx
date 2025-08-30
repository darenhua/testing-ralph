"use client";

import { useEffect, useState, useCallback } from "react";
import { useFile } from "@/contexts/file-context";
import { Skeleton } from "@/components/ui/skeleton";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import "katex/dist/katex.min.css";
import { mathConfig } from "@/lib/math-config";
import styles from "./latex-preview.module.css";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LaTeXPreviewProps {
  className?: string;
  pollingInterval?: number;
}

export function LaTeXPreview({ 
  className = "", 
  pollingInterval = 2000 
}: LaTeXPreviewProps) {
  const { fileId } = useFile();
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastModified, setLastModified] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchFileContent = useCallback(async () => {
    if (!fileId) {
      setError("No file selected");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/files/${fileId}?filename=file_clone.tex`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const text = await response.text();
      const modifiedHeader = response.headers.get("last-modified");
      
      // Only update content if it has changed
      if (modifiedHeader !== lastModified) {
        setContent(text);
        setLastModified(modifiedHeader);
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load file");
      console.error("Error fetching LaTeX file:", err);
    } finally {
      setIsLoading(false);
    }
  }, [fileId, lastModified]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setLastModified(null); // Force refresh
    await fetchFileContent();
    setIsRefreshing(false);
  }, [fetchFileContent]);

  // Initial fetch
  useEffect(() => {
    fetchFileContent();
  }, [fetchFileContent]);

  // Set up polling for real-time updates
  useEffect(() => {
    if (!fileId || pollingInterval <= 0) return;

    const interval = setInterval(fetchFileContent, pollingInterval);
    
    return () => clearInterval(interval);
  }, [fileId, pollingInterval, fetchFileContent]);

  // Preprocess LaTeX content to convert common LaTeX commands to markdown
  const preprocessLatex = useCallback((latex: string): string => {
    let processed = latex;
    
    // Convert LaTeX sections to markdown headers
    processed = processed.replace(/\\section\{([^}]+)\}/g, '# $1');
    processed = processed.replace(/\\subsection\{([^}]+)\}/g, '## $1');
    processed = processed.replace(/\\subsubsection\{([^}]+)\}/g, '### $1');
    
    // Convert LaTeX lists
    processed = processed.replace(/\\begin\{itemize\}/g, '');
    processed = processed.replace(/\\end\{itemize\}/g, '');
    processed = processed.replace(/\\begin\{enumerate\}/g, '');
    processed = processed.replace(/\\end\{enumerate\}/g, '');
    processed = processed.replace(/\\item\s+/g, '- ');
    
    // Convert LaTeX emphasis
    processed = processed.replace(/\\textbf\{([^}]+)\}/g, '**$1**');
    processed = processed.replace(/\\emph\{([^}]+)\}/g, '*$1*');
    processed = processed.replace(/\\textit\{([^}]+)\}/g, '*$1*');
    
    // Convert display math environments
    processed = processed.replace(/\\begin\{equation\}/g, '$$');
    processed = processed.replace(/\\end\{equation\}/g, '$$');
    processed = processed.replace(/\\begin\{align\}/g, '$$\\begin{align}');
    processed = processed.replace(/\\end\{align\}/g, '\\end{align}$$');
    processed = processed.replace(/\\\[/g, '$$');
    processed = processed.replace(/\\\]/g, '$$');
    
    // Convert inline math (handle escaped dollar signs)
    processed = processed.replace(/(?<!\\)\$([^$]+)(?<!\\)\$/g, '$$$1$$');
    
    // Handle theorem environments
    processed = processed.replace(/\\begin\{theorem\}/g, '<div class="theorem">');
    processed = processed.replace(/\\end\{theorem\}/g, '</div>');
    processed = processed.replace(/\\begin\{lemma\}/g, '<div class="lemma">');
    processed = processed.replace(/\\end\{lemma\}/g, '</div>');
    processed = processed.replace(/\\begin\{definition\}/g, '<div class="definition">');
    processed = processed.replace(/\\end\{definition\}/g, '</div>');
    processed = processed.replace(/\\begin\{proof\}/g, '<div class="proof">');
    processed = processed.replace(/\\end\{proof\}/g, '</div>');
    processed = processed.replace(/\\begin\{proposition\}/g, '<div class="proposition">');
    processed = processed.replace(/\\end\{proposition\}/g, '</div>');
    processed = processed.replace(/\\begin\{corollary\}/g, '<div class="corollary">');
    processed = processed.replace(/\\end\{corollary\}/g, '</div>');
    
    // Handle other common LaTeX commands
    processed = processed.replace(/\\vskip[\d.]+in/g, '\n\n');
    processed = processed.replace(/\\centerline\{([^}]+)\}/g, '<center>$1</center>');
    processed = processed.replace(/\\texttt\{([^}]+)\}/g, '`$1`');
    processed = processed.replace(/\\underline\{([^}]+)\}/g, '<u>$1</u>');
    
    // Handle tabular environments (basic support)
    processed = processed.replace(/\\begin\{tabular\}\{[^}]+\}/g, '<table>');
    processed = processed.replace(/\\end\{tabular\}/g, '</table>');
    processed = processed.replace(/&/g, '</td><td>');
    processed = processed.replace(/\\\\/g, '</td></tr><tr><td>');
    processed = processed.replace(/<table>/g, '<table><tr><td>');
    processed = processed.replace(/<\/table>/g, '</td></tr></table>');
    
    // Remove document class and preamble commands
    processed = processed.replace(/\\documentclass[^}]*\}/g, '');
    processed = processed.replace(/\\usepackage[^}]*\}/g, '');
    processed = processed.replace(/\\begin\{document\}/g, '');
    processed = processed.replace(/\\end\{document\}/g, '');
    processed = processed.replace(/\\maketitle/g, '');
    processed = processed.replace(/\\title\{([^}]+)\}/g, '# $1');
    processed = processed.replace(/\\author\{([^}]+)\}/g, '*Author: $1*');
    processed = processed.replace(/\\date\{([^}]+)\}/g, '*Date: $1*');
    
    return processed;
  }, []);

  // Process LaTeX content to HTML with KaTeX
  const processedContent = useCallback(async (latex: string) => {
    try {
      // First preprocess the LaTeX
      const preprocessed = preprocessLatex(latex);
      
      const processor = unified()
        .use(remarkParse)
        .use(remarkMath)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeKatex, mathConfig.katexOptions)
        .use(rehypeStringify);

      const result = await processor.process(preprocessed);
      return result.toString();
    } catch (err) {
      console.error("Error processing LaTeX:", err);
      return `<pre>${latex}</pre>`;
    }
  }, [preprocessLatex]);

  const [renderedContent, setRenderedContent] = useState<string>("");

  useEffect(() => {
    if (content) {
      processedContent(content).then(setRenderedContent);
    }
  }, [content, processedContent]);

  if (!fileId) {
    return (
      <div className={`flex items-center justify-center h-full text-muted-foreground ${className}`}>
        <p>No file selected. Upload a LaTeX file to preview it here.</p>
      </div>
    );
  }

  if (isLoading && !content) {
    return (
      <div className={`space-y-4 p-6 ${className}`}>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center space-y-2">
          <p className="text-destructive font-semibold">Error loading preview</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button 
            onClick={fetchFileContent}
            className="text-sm text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles['latex-preview']} ${className}`}>
      <div className="bg-background rounded-lg shadow-sm border h-full flex flex-col">
        <div className="px-6 py-4 border-b flex-shrink-0 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground">
            LaTeX Preview
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="h-8 px-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="ml-2 text-xs">Refresh</span>
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div 
            className="px-6 py-6 prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          />
        </div>
      </div>
    </div>
  );
}