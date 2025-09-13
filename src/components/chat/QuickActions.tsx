import React, { useState } from 'react';
import { Button } from '@/components/ui/enhanced-button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wand2, 
  Code2, 
  FileText, 
  Lightbulb, 
  BookOpen,
  Zap,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  prompt: string;
  category: 'code' | 'writing' | 'analysis' | 'creative';
  color: string;
}

interface QuickActionsProps {
  onActionSelect: (prompt: string) => void;
  className?: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'explain-code',
    title: 'Explain Code',
    description: 'Get detailed explanations of code snippets',
    icon: Code2,
    prompt: 'Explain this code step by step, including what each part does and any best practices used:',
    category: 'code',
    color: 'bg-blue-500'
  },
  {
    id: 'optimize-code',
    title: 'Optimize Code',
    description: 'Improve performance and readability',
    icon: Zap,
    prompt: 'Analyze and optimize this code for better performance, readability, and maintainability. Suggest improvements:',
    category: 'code',
    color: 'bg-yellow-500'
  },
  {
    id: 'debug-help',
    title: 'Debug Issue',
    description: 'Help find and fix bugs',
    icon: Wand2,
    prompt: 'Help me debug this issue. Here\'s my code and the error I\'m getting:',
    category: 'code',
    color: 'bg-red-500'
  },
  {
    id: 'write-docs',
    title: 'Write Documentation',
    description: 'Generate comprehensive documentation',
    icon: FileText,
    prompt: 'Create detailed documentation for this code, including usage examples and API reference:',
    category: 'writing',
    color: 'bg-green-500'
  },
  {
    id: 'code-review',
    title: 'Code Review',
    description: 'Professional code review and feedback',
    icon: BookOpen,
    prompt: 'Perform a thorough code review of this implementation. Check for security, performance, maintainability, and best practices:',
    category: 'analysis',
    color: 'bg-purple-500'
  },
  {
    id: 'brainstorm',
    title: 'Brainstorm Ideas',
    description: 'Generate creative solutions and ideas',
    icon: Lightbulb,
    prompt: 'Help me brainstorm creative solutions for this problem. Consider multiple approaches and innovative ideas:',
    category: 'creative',
    color: 'bg-orange-500'
  },
  {
    id: 'refactor',
    title: 'Refactor Code',
    description: 'Restructure code for better design',
    icon: Sparkles,
    prompt: 'Refactor this code to follow clean code principles, improve structure, and enhance maintainability:',
    category: 'code',
    color: 'bg-indigo-500'
  }
];

const QuickActions: React.FC<QuickActionsProps> = ({ onActionSelect, className }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = ['all', 'code', 'writing', 'analysis', 'creative'];
  
  const filteredActions = selectedCategory === 'all' 
    ? quickActions 
    : quickActions.filter(action => action.category === selectedCategory);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(category => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "secondary"}
            className="cursor-pointer capitalize hover:scale-105 transition-transform"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Actions Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <Card 
              key={action.id}
              className="p-4 cursor-pointer hover-lift hover-glow transition-all group border-l-4 border-l-transparent hover:border-l-primary"
              onClick={() => onActionSelect(action.prompt)}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-lg text-white flex-shrink-0",
                  action.color
                )}>
                  <IconComponent className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {action.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredActions.length === 0 && (
        <div className="text-center py-8">
          <div className="text-muted-foreground">
            <Wand2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No actions available in this category</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActions;