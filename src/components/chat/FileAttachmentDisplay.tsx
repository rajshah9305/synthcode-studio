import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { FileAttachment } from '@/types/chat';
import { 
  File, 
  FileText, 
  FileImage, 
  FileVideo, 
  FileAudio,
  Download,
  Eye,
  X 
} from 'lucide-react';
import { toast } from 'sonner';

interface FileAttachmentDisplayProps {
  attachment: FileAttachment;
  showRemove?: boolean;
  onRemove?: (id: string) => void;
}

const FileAttachmentDisplay: React.FC<FileAttachmentDisplayProps> = ({
  attachment,
  showRemove = false,
  onRemove,
}) => {
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return FileImage;
    if (type.startsWith('video/')) return FileVideo;
    if (type.startsWith('audio/')) return FileAudio;
    if (type.includes('text') || type.includes('json') || type.includes('xml')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeColor = (type: string) => {
    if (type.startsWith('image/')) return 'bg-green-500';
    if (type.startsWith('video/')) return 'bg-purple-500';
    if (type.startsWith('audio/')) return 'bg-blue-500';
    if (type.includes('text') || type.includes('json')) return 'bg-yellow-500';
    if (type.includes('pdf')) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const handleDownload = () => {
    if (attachment.url) {
      const a = document.createElement('a');
      a.href = attachment.url;
      a.download = attachment.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('File downloaded');
    }
  };

  const handlePreview = () => {
    if (attachment.url && attachment.type.startsWith('image/')) {
      window.open(attachment.url, '_blank');
    } else {
      toast.info('Preview not available for this file type');
    }
  };

  const FileIcon = getFileIcon(attachment.type);

  return (
    <Card className="flex items-center gap-3 p-3 animate-slide-up">
      {/* File Icon */}
      <div className={`p-2 rounded-md ${getFileTypeColor(attachment.type)}`}>
        <FileIcon className="h-4 w-4 text-white" />
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{attachment.name}</p>
          <Badge variant="secondary" className="text-xs">
            {attachment.type.split('/')[1]?.toUpperCase() || 'FILE'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(attachment.size)}
        </p>
      </div>

      {/* File Preview (for images) */}
      {attachment.type.startsWith('image/') && attachment.url && (
        <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
          <img
            src={attachment.url}
            alt={attachment.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1">
        {attachment.type.startsWith('image/') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreview}
            className="h-7 px-2"
          >
            <Eye className="h-3 w-3" />
          </Button>
        )}
        
        {attachment.url && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-7 px-2"
          >
            <Download className="h-3 w-3" />
          </Button>
        )}

        {showRemove && onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(attachment.id)}
            className="h-7 px-2 text-destructive hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </Card>
  );
};

export default FileAttachmentDisplay;