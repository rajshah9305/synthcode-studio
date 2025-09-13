import React from 'react';
import { Button } from '@/components/ui/enhanced-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Menu, Settings, Sun, Moon } from 'lucide-react';
import { AIModel } from '@/types/chat';
import { useTheme } from 'next-themes';

interface ChatHeaderProps {
  selectedModel?: AIModel;
  availableModels: AIModel[];
  onModelChange: (modelId: string) => void;
  onToggleSidebar: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedModel,
  availableModels,
  onModelChange,
  onToggleSidebar,
}) => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-primary">
            <Brain className="h-6 w-6" />
            <span className="font-semibold text-lg">AI Chat Fusion</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Select
          value={selectedModel?.id}
          onValueChange={onModelChange}
        >
          <SelectTrigger className="w-48 bg-muted/50">
            <SelectValue placeholder="Select model..." />
          </SelectTrigger>
          <SelectContent>
            {availableModels.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{model.name}</span>
                  <span className="text-xs text-muted-foreground">{model.provider}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};

export default ChatHeader;