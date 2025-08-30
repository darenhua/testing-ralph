"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { DefaultChatTransport } from "ai";
import { Thread } from "@/components/assistant-ui/thread";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { useFile } from "@/contexts/file-context";
import { ChatToolbar } from "@/components/chat-toolbar";
import { LaTeXPreview } from "@/components/latex-preview";

export const Assistant = () => {
  const { fileId } = useFile();
  const [leftWidth, setLeftWidth] = useState(50); // percentage
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  
  // Configure the runtime to include fileId in requests
  const runtime = useChatRuntime({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        fileId: fileId,
      },
    }),
  });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Enforce minimum widths (300px minimum for each panel)
    const minWidthPercent = (300 / containerRect.width) * 100;
    const maxWidthPercent = 100 - minWidthPercent;
    
    if (newLeftWidth >= minWidthPercent && newLeftWidth <= maxWidthPercent) {
      setLeftWidth(newLeftWidth);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <SidebarProvider>
        <div className="flex h-dvh w-full pr-0.5">
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Math Homework Assistant</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <div ref={containerRef} className="flex-1 flex overflow-hidden">
              {/* Left Panel - Chat */}
              <div 
                className="overflow-hidden flex flex-col"
                style={{ width: `${leftWidth}%`, minWidth: "300px" }}
              >
                <ChatToolbar />
                <Thread />
              </div>
              
              {/* Resizable Divider */}
              <div
                className="w-1 bg-border cursor-col-resize hover:bg-primary/20 transition-colors relative flex-shrink-0"
                onMouseDown={handleMouseDown}
              >
                <div className="absolute inset-y-0 -inset-x-1" />
              </div>
              
              {/* Right Panel - LaTeX Preview */}
              <div 
                className="flex-1 overflow-hidden bg-muted/30"
                style={{ minWidth: "300px" }}
              >
                <LaTeXPreview className="h-full" />
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AssistantRuntimeProvider>
  );
};
