import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Brain } from 'lucide-react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <Avatar className="h-8 w-8 border-2 border-primary/20">
        <AvatarFallback className="bg-primary text-primary-foreground">
          <Brain className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      
      <Card className="p-3 bg-chat-bubble-ai text-chat-bubble-ai-foreground max-w-xs">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">AI is thinking</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce-gentle" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce-gentle" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce-gentle" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TypingIndicator;