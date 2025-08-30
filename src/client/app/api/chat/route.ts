import { openai } from "@ai-sdk/openai";
import {
  streamText,
  UIMessage,
  convertToModelMessages,
} from "ai";
import { readFile } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  const { messages, fileId }: { messages: UIMessage[]; fileId?: string } = await req.json();
  
  // Prepare system message with file context if fileId is provided
  let systemMessage = "You are a helpful math homework assistant.";
  
  if (fileId) {
    try {
      // Read the file content from storage
      const storageBasePath = path.join(process.cwd(), 'src', 'backend', 'storage');
      const cloneFilePath = path.join(storageBasePath, fileId, 'file_clone.tex');
      
      const fileContent = await readFile(cloneFilePath, 'utf-8');
      
      systemMessage = `You are a helpful math homework assistant. The user has uploaded a LaTeX file with the following content:

<latex_file>
${fileContent}
</latex_file>

Please help the user with their math homework based on this file. You can reference specific problems, equations, or sections from the file when providing assistance.`;
    } catch (error) {
      console.error('Error reading file:', error);
      systemMessage = "You are a helpful math homework assistant. Note: There was an error accessing the uploaded file.";
    }
  }
  
  const result = streamText({
    model: openai("gpt-4o"),
    system: systemMessage,
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
