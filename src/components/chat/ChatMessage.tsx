import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message } from '@/types/chat';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/enhanced-button';
import { Copy, Edit2, Download, Play } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import CodeArtifactRenderer from './CodeArtifactRenderer';
import FileAttachmentDisplay from './FileAttachmentDisplay';

interface ChatMessageProps {
  message: Message;
  isLast?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLast }) => {
  const isUser = message.role === 'user';
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(timestamp);
  };

  return (
    <div className={cn(
      "group relative max-w-4xl mx-auto animate-slide-up",
      isUser ? "ml-auto" : "mr-auto"
    )}>
      <div className={cn(
        "flex gap-3 p-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        {/* Avatar */}
        <Avatar className={cn(
          "w-8 h-8 shrink-0",
          isUser ? "bg-chat-bubble-user" : "bg-chat-bubble-ai"
        )}>
          <AvatarFallback className={cn(
            "text-xs font-semibold",
            isUser 
              ? "bg-chat-bubble-user text-chat-bubble-user-foreground" 
              : "bg-chat-bubble-ai text-chat-bubble-ai-foreground"
          )}>
            {isUser ? 'U' : 'AI'}
          </AvatarFallback>
        </Avatar>

        {/* Message Content */}
        <div className={cn(
          "flex-1 space-y-2",
          isUser ? "text-right" : "text-left"
        )}>
          {/* Message Header */}
          <div className={cn(
            "flex items-center gap-2 text-xs text-muted-foreground",
            isUser ? "justify-end" : "justify-start"
          )}>
            <span>{isUser ? 'You' : 'Assistant'}</span>
            <span>•</span>
            <span>{formatTimestamp(message.timestamp)}</span>
            {message.metadata?.responseTime && (
              <>
                <span>•</span>
                <Badge variant="secondary" className="text-xs px-2 py-0">
                  {message.metadata.responseTime}ms
                </Badge>
              </>
            )}
          </div>

          {/* File Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="space-y-2">
              {message.attachments.map((attachment) => (
                <FileAttachmentDisplay key={attachment.id} attachment={attachment} />
              ))}
            </div>
          )}

          {/* Message Text */}
          <Card className={cn(
            "p-4 prose prose-sm max-w-none",
            isUser 
              ? "bg-chat-bubble-user text-chat-bubble-user-foreground border-chat-bubble-user" 
              : "bg-chat-bubble-ai text-chat-bubble-ai-foreground"
          )}>
            {isUser ? (
              <p className="m-0 whitespace-pre-wrap">{message.content}</p>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : '';
                    const inline = !className?.includes('language-');
                    
                    if (!inline && language) {
                      return (
                        <div className="relative">
                          <div className="flex items-center justify-between bg-code-bg text-code-text px-4 py-2 text-xs border-b border-border/20">
                            <span>{language}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(String(children).replace(/\n$/, ''))}
                              className="h-6 px-2 text-xs hover:bg-background/20"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <SyntaxHighlighter
                            style={oneDark as any}
                            language={language}
                            PreTag="div"
                            className="!mt-0 !bg-code-bg"
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        </div>
                      );
                    }
                    
                    return (
                      <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </Card>

          {/* Code Artifacts */}
          {message.codeArtifacts && message.codeArtifacts.length > 0 && (
            <div className="space-y-3">
              {message.codeArtifacts.map((artifact) => (
                <CodeArtifactRenderer key={artifact.id} artifact={artifact} />
              ))}
            </div>
          )}

          {/* Message Actions */}
          {!isUser && (
            <div className={cn(
              "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
              isUser ? "justify-end" : "justify-start"
            )}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(message.content)}
                className="h-7 px-2 text-xs"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;