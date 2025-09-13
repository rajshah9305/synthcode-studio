import React, { useState } from 'react';
import { Button } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, Heart, Laugh, Frown, Zap } from 'lucide-react';

interface Reaction {
  emoji: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  reacted: boolean;
}

interface MessageReactionsProps {
  messageId: string;
  reactions?: Reaction[];
  onReact?: (messageId: string, emoji: string) => void;
}

const defaultReactions: Reaction[] = [
  { emoji: '👍', icon: ThumbsUp, count: 0, reacted: false },
  { emoji: '👎', icon: ThumbsDown, count: 0, reacted: false },
  { emoji: '❤️', icon: Heart, count: 0, reacted: false },
  { emoji: '😂', icon: Laugh, count: 0, reacted: false },
  { emoji: '😢', icon: Frown, count: 0, reacted: false },
  { emoji: '⚡', icon: Zap, count: 0, reacted: false },
];

const MessageReactions: React.FC<MessageReactionsProps> = ({ 
  messageId, 
  reactions = defaultReactions,
  onReact 
}) => {
  const [localReactions, setLocalReactions] = useState(reactions);
  const [showReactions, setShowReactions] = useState(false);

  const handleReact = (emoji: string) => {
    setLocalReactions(prev => prev.map(reaction => {
      if (reaction.emoji === emoji) {
        return {
          ...reaction,
          count: reaction.reacted ? reaction.count - 1 : reaction.count + 1,
          reacted: !reaction.reacted
        };
      }
      return reaction;
    }));
    
    onReact?.(messageId, emoji);
  };

  const visibleReactions = localReactions.filter(r => r.count > 0);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mt-2">
        {/* Show active reactions */}
        {visibleReactions.map(({ emoji, count, reacted, icon: Icon }) => (
          <Badge
            key={emoji}
            variant={reacted ? "default" : "secondary"}
            className={`cursor-pointer hover:scale-105 transition-transform ${
              reacted ? 'bg-primary text-primary-foreground' : ''
            }`}
            onClick={() => handleReact(emoji)}
          >
            <Icon className="h-3 w-3 mr-1" />
            {count}
          </Badge>
        ))}

        {/* React button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setShowReactions(!showReactions)}
        >
          + React
        </Button>
      </div>

      {/* Reaction picker */}
      {showReactions && (
        <div className="absolute bottom-8 left-0 z-10 animate-fade-in">
          <div className="flex items-center gap-1 p-2 bg-popover border rounded-lg shadow-lg">
            {defaultReactions.map(({ emoji, icon: Icon }) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-1 hover:bg-accent"
                onClick={() => {
                  handleReact(emoji);
                  setShowReactions(false);
                }}
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageReactions;