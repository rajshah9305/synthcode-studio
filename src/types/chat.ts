export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    responseTime?: number;
    tokenCount?: number;
    model?: string;
  };
  attachments?: FileAttachment[];
  codeArtifacts?: CodeArtifact[];
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  content?: string;
}

export interface CodeArtifact {
  id: string;
  title: string;
  language: string;
  code: string;
  description?: string;
  isEditable: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  provider: string;
  maxTokens?: number;
}