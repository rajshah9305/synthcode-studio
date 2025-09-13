import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeArtifact } from '@/types/chat';
import { Copy, Download, Play, Edit2, Eye, Code } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'sonner';
import Editor from '@monaco-editor/react';

interface CodeArtifactRendererProps {
  artifact: CodeArtifact;
}

const CodeArtifactRenderer: React.FC<CodeArtifactRendererProps> = ({ artifact }) => {
  const [activeTab, setActiveTab] = useState('preview');
  const [editableCode, setEditableCode] = useState(artifact.code);
  const [isEditing, setIsEditing] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(artifact.code);
    toast.success('Code copied to clipboard');
  };

  const downloadCode = () => {
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      html: 'html',
      css: 'css',
      json: 'json',
      jsx: 'jsx',
      tsx: 'tsx',
    };

    const extension = extensions[artifact.language] || 'txt';
    const blob = new Blob([artifact.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artifact.title}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Code downloaded');
  };

  const runCode = () => {
    // For demo purposes - in a real app, this would execute code in a sandbox
    toast.info('Code execution not implemented in this demo');
  };

  const saveEdit = () => {
    // In a real app, this would save the edited code
    setIsEditing(false);
    toast.success('Changes saved');
  };

  const renderPreview = () => {
    // Simple HTML preview for HTML content
    if (artifact.language === 'html') {
      return (
        <div className="border rounded-md bg-background">
          <iframe
            srcDoc={artifact.code}
            className="w-full h-96 rounded-md"
            sandbox="allow-scripts"
            title="HTML Preview"
          />
        </div>
      );
    }

    // For other languages, show formatted code
    return (
      <div className="relative">
        <SyntaxHighlighter
          language={artifact.language}
          style={oneDark}
          customStyle={{ margin: 0, borderRadius: '0.375rem' }}
        >
          {artifact.code}
        </SyntaxHighlighter>
      </div>
    );
  };

  return (
    <Card className="w-full animate-slide-up">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">{artifact.title}</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {artifact.language}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyCode}
              className="h-7 px-2 text-xs"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadCode}
              className="h-7 px-2 text-xs"
            >
              <Download className="h-3 w-3" />
            </Button>
            {(artifact.language === 'javascript' || artifact.language === 'python') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={runCode}
                className="h-7 px-2 text-xs"
              >
                <Play className="h-3 w-3" />
              </Button>
            )}
            {artifact.isEditable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="h-7 px-2 text-xs"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        {artifact.description && (
          <p className="text-xs text-muted-foreground mt-1">
            {artifact.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview" className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-1">
              <Code className="h-3 w-3" />
              Code
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="mt-4">
            {renderPreview()}
          </TabsContent>
          
          <TabsContent value="code" className="mt-4">
            {isEditing && artifact.isEditable ? (
              <div className="space-y-3">
                <Editor
                  height="300px"
                  language={artifact.language}
                  value={editableCode}
                  onChange={(value) => setEditableCode(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={saveEdit}>
                    Save Changes
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setEditableCode(artifact.code);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <SyntaxHighlighter
                language={artifact.language}
                style={oneDark}
                customStyle={{ margin: 0, borderRadius: '0.375rem' }}
              >
                {artifact.code}
              </SyntaxHighlighter>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CodeArtifactRenderer;