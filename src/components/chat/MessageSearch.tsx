import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/enhanced-button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, X, ChevronUp, ChevronDown, Filter } from 'lucide-react';
import { Message } from '@/types/chat';
import { cn } from '@/lib/utils';

interface MessageSearchProps {
  messages: Message[];
  onMessageSelect: (messageId: string) => void;
  className?: string;
}

interface SearchResult {
  message: Message;
  matchType: 'content' | 'code' | 'metadata';
  preview: string;
}

const MessageSearch: React.FC<MessageSearchProps> = ({ 
  messages, 
  onMessageSelect,
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filterType, setFilterType] = useState<'all' | 'user' | 'assistant' | 'code'>('all');

  useEffect(() => {
    if (query.trim()) {
      const searchResults: SearchResult[] = [];
      const lowerQuery = query.toLowerCase();

      messages.forEach(message => {
        // Skip if filter doesn't match
        if (filterType !== 'all') {
          if (filterType === 'code' && !message.codeArtifacts?.length) return;
          if (filterType !== 'code' && message.role !== filterType) return;
        }

        // Search in content
        if (message.content.toLowerCase().includes(lowerQuery)) {
          const index = message.content.toLowerCase().indexOf(lowerQuery);
          const start = Math.max(0, index - 30);
          const end = Math.min(message.content.length, index + query.length + 30);
          const preview = `...${message.content.slice(start, end)}...`;

          searchResults.push({
            message,
            matchType: 'content',
            preview
          });
        }

        // Search in code artifacts
        if (message.codeArtifacts) {
          message.codeArtifacts.forEach(artifact => {
            if (artifact.code.toLowerCase().includes(lowerQuery) || 
                artifact.title.toLowerCase().includes(lowerQuery)) {
              searchResults.push({
                message,
                matchType: 'code',
                preview: `Code: ${artifact.title}`
              });
            }
          });
        }

        // Search in metadata
        if (message.metadata?.model?.toLowerCase().includes(lowerQuery)) {
          searchResults.push({
            message,
            matchType: 'metadata',
            preview: `Model: ${message.metadata.model}`
          });
        }
      });

      setResults(searchResults.slice(0, 20)); // Limit results
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  }, [query, messages, filterType]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        setQuery('');
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(0, prev - 1));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(results.length - 1, prev + 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          onMessageSelect(results[selectedIndex].message.id);
          setIsOpen(false);
          setQuery('');
        }
        break;
    }
  };

  const getMatchTypeColor = (type: SearchResult['matchType']) => {
    switch (type) {
      case 'content': return 'bg-blue-500';
      case 'code': return 'bg-green-500';
      case 'metadata': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Search Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="hover-lift"
      >
        <Search className="h-4 w-4" />
      </Button>

      {/* Search Panel */}
      {isOpen && (
        <Card className="absolute top-12 right-0 w-96 p-4 z-50 animate-fade-in shadow-lg">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Search Messages</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search messages, code, metadata..."
                className="pl-10 pr-4"
                autoFocus
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              {(['all', 'user', 'assistant', 'code'] as const).map(type => (
                <Badge
                  key={type}
                  variant={filterType === type ? "default" : "secondary"}
                  className="cursor-pointer capitalize"
                  onClick={() => setFilterType(type)}
                >
                  <Filter className="h-3 w-3 mr-1" />
                  {type}
                </Badge>
              ))}
            </div>

            {/* Results */}
            {query && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {results.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No messages found
                  </p>
                ) : (
                  results.map((result, index) => (
                    <div
                      key={`${result.message.id}-${result.matchType}`}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-colors",
                        selectedIndex === index
                          ? "bg-accent border-primary"
                          : "bg-background hover:bg-muted"
                      )}
                      onClick={() => {
                        onMessageSelect(result.message.id);
                        setIsOpen(false);
                        setQuery('');
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="secondary"
                              className={cn("text-xs", getMatchTypeColor(result.matchType))}
                            >
                              {result.matchType}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {result.message.role}
                            </span>
                          </div>
                          <p className="text-sm text-foreground line-clamp-2">
                            {result.preview}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {result.message.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Footer */}
            {results.length > 0 && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
                <div className="flex items-center gap-1">
                  <ChevronUp className="h-3 w-3" />
                  <ChevronDown className="h-3 w-3" />
                  <span>Navigate</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default MessageSearch;