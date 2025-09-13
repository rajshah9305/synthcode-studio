import React, { useState } from 'react';
import { Button } from '@/components/ui/enhanced-button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  FileText, 
  Code, 
  Share, 
  Copy, 
  CheckCircle,
  X 
} from 'lucide-react';
import { ChatSession } from '@/types/chat';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ExportChatProps {
  session: ChatSession;
  className?: string;
}

const ExportChat: React.FC<ExportChatProps> = ({ session, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'markdown' | 'json' | 'txt'>('markdown');
  const [copied, setCopied] = useState(false);

  const generateMarkdown = () => {
    let content = `# ${session.title}\n\n`;
    content += `*Session created: ${session.createdAt.toLocaleString()}*\n\n`;
    
    session.messages.forEach((message, index) => {
      content += `## ${message.role === 'user' ? 'User' : 'Assistant'}\n\n`;
      content += `${message.content}\n\n`;
      
      if (message.codeArtifacts?.length) {
        message.codeArtifacts.forEach(artifact => {
          content += `### ${artifact.title}\n\n`;
          content += `\`\`\`${artifact.language}\n${artifact.code}\n\`\`\`\n\n`;
        });
      }
      
      if (message.attachments?.length) {
        content += `**Attachments:** ${message.attachments.map(att => att.name).join(', ')}\n\n`;
      }
      
      if (index < session.messages.length - 1) {
        content += '---\n\n';
      }
    });
    
    return content;
  };

  const generateJSON = () => {
    return JSON.stringify({
      session: {
        id: session.id,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
      messages: session.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        metadata: msg.metadata,
        codeArtifacts: msg.codeArtifacts,
        attachments: msg.attachments?.map(att => ({
          name: att.name,
          type: att.type,
          size: att.size
        }))
      }))
    }, null, 2);
  };

  const generatePlainText = () => {
    let content = `${session.title}\n`;
    content += `Session created: ${session.createdAt.toLocaleString()}\n\n`;
    content += '='.repeat(50) + '\n\n';
    
    session.messages.forEach((message, index) => {
      content += `[${message.role.toUpperCase()}] ${message.timestamp.toLocaleString()}\n`;
      content += `${message.content}\n`;
      
      if (message.codeArtifacts?.length) {
        message.codeArtifacts.forEach(artifact => {
          content += `\nCODE: ${artifact.title} (${artifact.language})\n`;
          content += artifact.code + '\n';
        });
      }
      
      if (message.attachments?.length) {
        content += `\nAttachments: ${message.attachments.map(att => att.name).join(', ')}\n`;
      }
      
      content += '\n' + '-'.repeat(30) + '\n\n';
    });
    
    return content;
  };

  const getExportContent = () => {
    switch (exportFormat) {
      case 'markdown': return generateMarkdown();
      case 'json': return generateJSON();
      case 'txt': return generatePlainText();
      default: return '';
    }
  };

  const getFileName = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const safeName = session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    return `chat_${safeName}_${timestamp}.${exportFormat}`;
  };

  const handleDownload = () => {
    const content = getExportContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = getFileName();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Chat exported successfully!');
    setIsOpen(false);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getExportContent());
      setCopied(true);
      toast.success('Content copied to clipboard!');
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: session.title,
          text: `AI Chat Session: ${session.title}`,
          files: [new File([getExportContent()], getFileName(), { type: 'text/plain' })]
        });
      } catch (error) {
        // Fallback to clipboard
        handleCopyToClipboard();
      }
    } else {
      // Fallback to clipboard
      handleCopyToClipboard();
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Export Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="hover-lift"
      >
        <Download className="h-4 w-4" />
      </Button>

      {/* Export Panel */}
      {isOpen && (
        <Card className="absolute top-12 right-0 w-80 p-4 z-50 animate-fade-in shadow-lg">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Export Chat</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Session Info */}
            <div className="space-y-2">
              <p className="text-sm font-medium">{session.title}</p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">
                  {session.messages.length} message{session.messages.length !== 1 ? 's' : ''}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {session.messages.filter(m => m.codeArtifacts?.length).length} code artifacts
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Format Selection */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Export Format</p>
              <div className="grid grid-cols-3 gap-2">
                {(['markdown', 'json', 'txt'] as const).map(format => (
                  <Button
                    key={format}
                    variant={exportFormat === format ? "default" : "outline"}
                    size="sm"
                    onClick={() => setExportFormat(format)}
                    className="text-xs"
                  >
                    {format === 'markdown' && <FileText className="h-3 w-3 mr-1" />}
                    {format === 'json' && <Code className="h-3 w-3 mr-1" />}
                    {format === 'txt' && <FileText className="h-3 w-3 mr-1" />}
                    {format.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                onClick={handleDownload}
                className="w-full justify-start"
                variant="hero"
              >
                <Download className="h-4 w-4 mr-2" />
                Download as {exportFormat.toUpperCase()}
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyToClipboard}
                  className="justify-start"
                >
                  {copied ? (
                    <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3 mr-1" />
                  )}
                  Copy
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="justify-start"
                >
                  <Share className="h-3 w-3 mr-1" />
                  Share
                </Button>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Preview:</p>
              <div className="bg-muted p-2 rounded text-xs max-h-20 overflow-hidden">
                <pre className="whitespace-pre-wrap">
                  {getExportContent().slice(0, 200)}...
                </pre>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ExportChat;