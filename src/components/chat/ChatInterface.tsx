import React, { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/enhanced-button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Message, ChatSession, AIModel, FileAttachment, CodeArtifact } from '@/types/chat';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ChatSidebar from './ChatSidebar';
import TypingIndicator from './TypingIndicator';
import MessageSearch from './MessageSearch';
import ExportChat from './ExportChat';
import QuickActions from './QuickActions';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Brain, Zap, Code, FileText, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ChatInterface: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState<AIModel>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const availableModels: AIModel[] = [
    {
      id: 'gpt-4o',
      name: 'GPT-4O',
      description: 'Most capable model, great for complex tasks',
      provider: 'OpenAI',
      maxTokens: 128000,
    },
    {
      id: 'claude-3.5-sonnet',
      name: 'Claude 3.5 Sonnet',
      description: 'Excellent for coding and analysis',
      provider: 'Anthropic',
      maxTokens: 200000,
    },
    {
      id: 'gpt-oss-120b',
      name: 'GPT-OSS-120B',
      description: 'Open source model via Cerebras',
      provider: 'Cerebras',
      maxTokens: 8000,
    },
  ];

  useEffect(() => {
    // Initialize with default model
    setSelectedModel(availableModels[2]); // Cerebras model to match the screenshots
    
    // Load demo session
    const demoSession = createDemoSession();
    setSessions([demoSession]);
    setActiveSessionId(demoSession.id);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [sessions, activeSessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createDemoSession = (): ChatSession => {
    const sessionId = 'demo-session-1';
    return {
      id: sessionId,
      title: 'Welcome to AI Chat Fusion',
      createdAt: new Date(Date.now() - 60000), // 1 minute ago
      updatedAt: new Date(),
      messages: [
        {
          id: '1',
          role: 'user',
          content: 'Cerebras chat UI has chat history?',
          timestamp: new Date(Date.now() - 50000),
        },
        {
          id: '2',
          role: 'assistant',
          content: `Yes — the Cerebras Chat UI (the web interface that ships with the Cerebras Model Garden / Cerebras Hub) keeps a **session-level chat history** for you. The history is displayed on the left-hand side (or in a collapsible panel) and persists as long as you stay in that browser session.

**Short answer:**

The Cerebras Chat UI does maintain chat history within your current session, making it easy to reference previous conversations and maintain context throughout your interaction.`,
          timestamp: new Date(Date.now() - 45000),
          metadata: {
            responseTime: 1430,
            tokenCount: 1707,
            model: 'GPT-OSS-120B',
          },
          codeArtifacts: [
            {
              id: 'demo-artifact-1',
              title: 'Flask API Example',
              language: 'python',
              code: `from flask import Flask, request, jsonify
import csv
import json

app = Flask(__name__)

@app.route('/api/parse-csv', methods=['POST'])
def parse_csv():
    """Parse a CSV file and return JSON data"""
    try:
        file = request.files['csv_file']
        if file.filename.endswith('.csv'):
            # Read CSV content
            csv_content = file.read().decode('utf-8')
            csv_reader = csv.DictReader(csv_content.splitlines())
            
            # Convert to JSON
            data = [row for row in csv_reader]
            
            return jsonify({
                'success': True,
                'data': data,
                'count': len(data)
            })
        else:
            return jsonify({'error': 'Invalid file format'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)`,
              description: 'A Flask API endpoint that parses CSV files and returns JSON data',
              isEditable: true,
            },
          ],
        },
      ],
    };
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const handleSendMessage = async (content: string, attachments: FileAttachment[]) => {
    if (!activeSession && !content.trim()) return;

    setIsLoading(true);

    try {
      let targetSession = activeSession;
      
      // Create new session if none exists
      if (!targetSession) {
        targetSession = {
          id: Date.now().toString(),
          title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date(),
        attachments,
      };

      // Simulate AI response
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: generateDemoResponse(content, attachments),
          timestamp: new Date(),
          metadata: {
            responseTime: Math.floor(Math.random() * 2000) + 800,
            tokenCount: Math.floor(Math.random() * 1000) + 500,
            model: selectedModel?.name || 'GPT-OSS-120B',
          },
          codeArtifacts: generateDemoCodeArtifacts(content),
        };

        setSessions(prev => {
          const updated = prev.map(s => 
            s.id === targetSession!.id 
              ? { ...s, messages: [...s.messages, userMessage, aiMessage], updatedAt: new Date() }
              : s
          );
          
          // Add new session if it doesn't exist
          if (!prev.find(s => s.id === targetSession!.id)) {
            updated.push({ ...targetSession!, messages: [userMessage, aiMessage] });
            setActiveSessionId(targetSession!.id);
          }
          
          return updated;
        });

        setIsLoading(false);
        toast.success('Message sent successfully');
      }, 1500);

      // Update session with user message immediately
      setSessions(prev => {
        const updated = prev.map(s => 
          s.id === targetSession!.id 
            ? { ...s, messages: [...s.messages, userMessage], updatedAt: new Date() }
            : s
        );
        
        if (!prev.find(s => s.id === targetSession!.id)) {
          updated.push({ ...targetSession!, messages: [userMessage] });
          setActiveSessionId(targetSession!.id);
        }
        
        return updated;
      });

    } catch (error) {
      setIsLoading(false);
      toast.error('Failed to send message');
    }
  };

  const generateDemoResponse = (userContent: string, attachments: FileAttachment[]): string => {
    const lowerContent = userContent.toLowerCase();
    
    if (lowerContent.includes('code') || lowerContent.includes('function') || lowerContent.includes('api')) {
      return `I'll help you create that code! Here's a comprehensive solution with best practices:

\`\`\`javascript
// Modern JavaScript implementation
function processData(input) {
  try {
    // Validate input
    if (!input || typeof input !== 'object') {
      throw new Error('Invalid input data');
    }
    
    // Process the data
    const result = Object.keys(input).map(key => ({
      key,
      value: input[key],
      processed: true,
      timestamp: new Date().toISOString()
    }));
    
    return {
      success: true,
      data: result,
      count: result.length
    };
  } catch (error) {
    console.error('Processing failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Usage example
const sampleData = { name: 'John', age: 30, city: 'New York' };
const processed = processData(sampleData);
console.log(processed);
\`\`\`

This implementation includes error handling, input validation, and follows modern JavaScript best practices. The function processes object data and returns a structured response with metadata.`;
    }

    if (attachments && attachments.length > 0) {
      return `I can see you've uploaded ${attachments.length} file(s). Let me analyze them for you:

${attachments.map(att => `📎 **${att.name}** (${att.type})`).join('\n')}

Based on the uploaded files, I can help you with:
- File analysis and processing
- Code review and optimization
- Data extraction and transformation
- Documentation generation

What specific task would you like me to perform with these files?`;
    }

    return `I understand you're asking about "${userContent}". Here's a comprehensive response:

This is a great question! Let me provide you with detailed information and examples. 

**Key Points:**
- Modern best practices and patterns
- Performance optimization techniques  
- Security considerations
- Real-world implementation examples

**Always verify indentation, line endings, and hidden characters after pasting.**

Happy coding! 🚀 If you run into a specific environment that isn't covered here, let me know and I'll dive into the details.`;
  };

  const generateDemoCodeArtifacts = (content: string): CodeArtifact[] | undefined => {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('react') || lowerContent.includes('component')) {
      return [
        {
          id: 'react-component-' + Date.now(),
          title: 'React Component Example',
          language: 'tsx',
          code: `import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  title: string;
  onSubmit: (data: any) => void;
}

const ExampleComponent: React.FC<Props> = ({ title, onSubmit }) => {
  const [data, setData] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <input
        value={data}
        onChange={(e) => setData(e.target.value)}
        className="w-full p-2 border rounded mb-4"
        placeholder="Enter your data..."
      />
      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Processing...' : 'Submit'}
      </Button>
    </Card>
  );
};

export default ExampleComponent;`,
          description: 'A reusable React component with TypeScript, state management, and modern patterns',
          isEditable: true,
        },
      ];
    }

    return undefined;
  };

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    toast.success('New chat created');
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId(sessions[0]?.id);
    }
    toast.success('Chat deleted');
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "transition-all duration-300 border-r border-border",
        isSidebarOpen ? "w-80" : "w-0 overflow-hidden"
      )}>
        <ChatSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSessionSelect={setActiveSessionId}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <ChatHeader
            selectedModel={selectedModel}
            availableModels={availableModels}
            onModelChange={(modelId) => {
              const model = availableModels.find(m => m.id === modelId);
              setSelectedModel(model);
            }}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          
          <div className="flex items-center gap-2">
            {activeSession && (
              <>
                <MessageSearch 
                  messages={activeSession.messages}
                  onMessageSelect={(messageId) => {
                    // Scroll to message logic can be added here
                    toast.info('Message selected');
                  }}
                />
                <ExportChat session={activeSession} />
              </>
            )}
            <ThemeToggle />
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {activeSession?.messages.length === 0 || !activeSession ? (
            // Welcome Screen
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-4xl w-full">
                <div className="flex items-center justify-center mb-8 animate-float">
                  <div className="p-6 rounded-full bg-gradient-to-br from-primary to-primary-glow shadow-[var(--shadow-elegant)]">
                    <Brain className="h-16 w-16 text-primary-foreground" />
                  </div>
                </div>
                
                <h1 className="text-4xl font-bold mb-4 animate-gradient bg-clip-text text-transparent">
                  Welcome to AI Chat Fusion
                </h1>
                <p className="text-muted-foreground mb-12 text-lg max-w-2xl mx-auto">
                  Your advanced AI assistant with file uploads, code artifacts, message search, export capabilities, and powerful tools. 
                  Start a conversation to experience the full capabilities.
                </p>

                {/* Feature Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                  <Card className="p-6 text-left hover-lift hover-glow group border-l-4 border-l-transparent hover:border-l-primary animate-fade-in">
                    <Zap className="h-8 w-8 text-primary mb-4 group-hover:animate-bounce-gentle" />
                    <h3 className="font-semibold mb-2">Fast Responses</h3>
                    <p className="text-sm text-muted-foreground">Lightning-fast AI powered by multiple models</p>
                  </Card>
                  
                  <Card className="p-6 text-left hover-lift hover-glow group border-l-4 border-l-transparent hover:border-l-primary animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <FileText className="h-8 w-8 text-primary mb-4 group-hover:animate-bounce-gentle" />
                    <h3 className="font-semibold mb-2">File Upload</h3>
                    <p className="text-sm text-muted-foreground">Upload and analyze any file type with smart processing</p>
                  </Card>
                  
                  <Card className="p-6 text-left hover-lift hover-glow group border-l-4 border-l-transparent hover:border-l-primary animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <Code className="h-8 w-8 text-primary mb-4 group-hover:animate-bounce-gentle" />
                    <h3 className="font-semibold mb-2">Code Artifacts</h3>
                    <p className="text-sm text-muted-foreground">Interactive code generation and live editing</p>
                  </Card>
                  
                  <Card className="p-6 text-left hover-lift hover-glow group border-l-4 border-l-transparent hover:border-l-primary animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <Sparkles className="h-8 w-8 text-primary mb-4 group-hover:animate-bounce-gentle" />
                    <h3 className="font-semibold mb-2">Advanced Tools</h3>
                    <p className="text-sm text-muted-foreground">Search, export, reactions, and powerful capabilities</p>
                  </Card>
                </div>

                {/* Quick Actions */}
                <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                  <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
                  <QuickActions 
                    onActionSelect={(prompt) => {
                      // Auto-fill the chat input with the selected prompt
                      handleSendMessage(prompt, []);
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                {activeSession.messages.map((message) => (
        <ChatMessage 
          key={message.id} 
          message={message}
        />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-border">
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              placeholder={selectedModel ? `Ask ${selectedModel.name} anything...` : "Ask me anything..."}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;