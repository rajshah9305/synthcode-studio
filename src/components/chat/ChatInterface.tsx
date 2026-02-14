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
import { streamChat } from '@/utils/streamChat';

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
    if (!content.trim()) return;

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

      // Update session with user message immediately
      setSessions(prev => {
        const exists = prev.find(s => s.id === targetSession!.id);
        if (exists) {
          return prev.map(s =>
            s.id === targetSession!.id
              ? { ...s, messages: [...s.messages, userMessage], updatedAt: new Date() }
              : s
          );
        }
        return [{ ...targetSession!, messages: [userMessage] }, ...prev];
      });
      if (!activeSession) setActiveSessionId(targetSession.id);

      // Build message history for AI
      const historyMessages = [...(targetSession.messages || []), userMessage].map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const assistantId = (Date.now() + 1).toString();
      let assistantContent = '';
      const startTime = Date.now();

      await streamChat({
        messages: historyMessages,
        model: selectedModel?.id,
        onDelta: (chunk) => {
          assistantContent += chunk;
          setSessions(prev =>
            prev.map(s => {
              if (s.id !== targetSession!.id) return s;
              const msgs = [...s.messages];
              const lastMsg = msgs[msgs.length - 1];
              if (lastMsg?.id === assistantId) {
                msgs[msgs.length - 1] = { ...lastMsg, content: assistantContent };
              } else {
                msgs.push({
                  id: assistantId,
                  role: 'assistant',
                  content: assistantContent,
                  timestamp: new Date(),
                  metadata: { model: selectedModel?.name || 'AI' },
                });
              }
              return { ...s, messages: msgs, updatedAt: new Date() };
            })
          );
        },
        onDone: () => {
          const responseTime = Date.now() - startTime;
          // Update metadata after streaming completes
          setSessions(prev =>
            prev.map(s => {
              if (s.id !== targetSession!.id) return s;
              const msgs = s.messages.map(m =>
                m.id === assistantId
                  ? {
                      ...m,
                      metadata: {
                        responseTime,
                        tokenCount: Math.round(assistantContent.length / 4),
                        model: selectedModel?.name || 'AI',
                      },
                    }
                  : m
              );
              return { ...s, messages: msgs };
            })
          );
          setIsLoading(false);
        },
        onError: (err) => {
          toast.error(err);
          setIsLoading(false);
        },
      });
    } catch (error) {
      setIsLoading(false);
      toast.error('Failed to send message');
    }
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