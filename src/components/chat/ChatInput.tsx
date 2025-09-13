import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/enhanced-button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { FileAttachment } from '@/types/chat';
import { 
  Send, 
  Paperclip, 
  Mic, 
  Square,
  Wand2,
  Code2,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import FileAttachmentDisplay from './FileAttachmentDisplay';

interface ChatInputProps {
  onSendMessage: (message: string, attachments: FileAttachment[]) => void;
  isLoading?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading = false,
  placeholder = "Ask me anything...",
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message.trim(), attachments);
      setMessage('');
      setAttachments([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) {
        handleSend();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach((file) => {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        const attachment: FileAttachment = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: file.type,
          size: file.size,
          url: e.target?.result as string,
        };
        
        setAttachments(prev => [...prev, attachment]);
      };

      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handleVoiceRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      toast.info('Voice recording stopped');
    } else {
      setIsRecording(true);
      toast.info('Voice recording started');
      // Simulate recording for demo
      setTimeout(() => {
        setIsRecording(false);
        toast.success('Voice message recorded');
      }, 3000);
    }
  };

  const insertCodeTemplate = () => {
    const codeTemplate = '```javascript\n// Your code here\nfunction example() {\n  return "Hello, World!";\n}\n```';
    setMessage(prev => prev + (prev ? '\n\n' : '') + codeTemplate);
    textareaRef.current?.focus();
  };

  const insertPromptTemplate = () => {
    const promptTemplate = 'Generate a [type of code/function] that [describe what it should do]. Please include:\n- [requirement 1]\n- [requirement 2]\n- [requirement 3]';
    setMessage(prev => prev + (prev ? '\n\n' : '') + promptTemplate);
    textareaRef.current?.focus();
  };

  return (
    <Card className="p-4 space-y-3 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Attachments</p>
          <div className="grid gap-2">
            {attachments.map((attachment) => (
              <FileAttachmentDisplay
                key={attachment.id}
                attachment={attachment}
                showRemove
                onRemove={removeAttachment}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={insertCodeTemplate}
          className="h-7 px-2 text-xs"
        >
          <Code2 className="h-3 w-3 mr-1" />
          Code
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={insertPromptTemplate}
          className="h-7 px-2 text-xs"
        >
          <Wand2 className="h-3 w-3 mr-1" />
          Template
        </Button>
      </div>

      {/* Input Area */}
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className="min-h-[44px] max-h-[200px] resize-none pr-12 bg-background"
            rows={1}
          />
          
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="h-7 w-7"
            >
              <Paperclip className="h-3 w-3" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleVoiceRecording}
              disabled={isLoading}
              className={`h-7 w-7 ${isRecording ? 'animate-pulse text-red-500' : ''}`}
            >
              {isRecording ? <Square className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        <Button
          onClick={handleSend}
          disabled={isLoading || (!message.trim() && attachments.length === 0)}
          variant="hero"
          size="icon"
          className="h-11 w-11"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
        accept="*/*"
      />

      <p className="text-xs text-muted-foreground text-center">
        Press <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Enter</kbd> to send, 
        <kbd className="px-1 py-0.5 text-xs bg-muted rounded ml-1">Shift + Enter</kbd> for new line
      </p>
    </Card>
  );
};

export default ChatInput;