import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Cpu, 
  MemoryStick, 
  Clock, 
  Zap, 
  TrendingUp,
  Activity,
  Database
} from 'lucide-react';
import { Message } from '@/types/chat';

interface PerformanceMetricsProps {
  messages: Message[];
  className?: string;
}

interface Metrics {
  averageResponseTime: number;
  totalMessages: number;
  totalTokens: number;
  successRate: number;
  activeModels: string[];
  codeArtifacts: number;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ 
  messages, 
  className 
}) => {
  const [metrics, setMetrics] = useState<Metrics>({
    averageResponseTime: 0,
    totalMessages: 0,
    totalTokens: 0,
    successRate: 100,
    activeModels: [],
    codeArtifacts: 0
  });

  useEffect(() => {
    const calculateMetrics = () => {
      const assistantMessages = messages.filter(m => m.role === 'assistant');
      
      const totalResponseTime = assistantMessages.reduce((sum, msg) => 
        sum + (msg.metadata?.responseTime || 0), 0);
      
      const totalTokens = assistantMessages.reduce((sum, msg) => 
        sum + (msg.metadata?.tokenCount || 0), 0);
      
      const uniqueModels = [...new Set(assistantMessages
        .map(m => m.metadata?.model)
        .filter(Boolean))];
      
      const codeArtifacts = assistantMessages.reduce((sum, msg) => 
        sum + (msg.codeArtifacts?.length || 0), 0);

      setMetrics({
        averageResponseTime: assistantMessages.length > 0 
          ? Math.round(totalResponseTime / assistantMessages.length) 
          : 0,
        totalMessages: messages.length,
        totalTokens,
        successRate: 100, // Could be calculated based on error states
        activeModels: uniqueModels as string[],
        codeArtifacts
      });
    };

    calculateMetrics();
  }, [messages]);

  const getResponseTimeColor = (time: number) => {
    if (time < 1000) return 'text-green-500';
    if (time < 2000) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance Metrics
          </h3>
          <Badge variant="outline" className="text-xs">
            Live
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Response Time */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Avg Response</span>
            </div>
            <div className={`text-lg font-semibold ${getResponseTimeColor(metrics.averageResponseTime)}`}>
              {metrics.averageResponseTime}ms
            </div>
            <Progress 
              value={Math.min((2000 - metrics.averageResponseTime) / 20, 100)} 
              className="h-1"
            />
          </div>

          {/* Success Rate */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Success Rate</span>
            </div>
            <div className="text-lg font-semibold text-green-500">
              {metrics.successRate}%
            </div>
            <Progress value={metrics.successRate} className="h-1" />
          </div>

          {/* Total Messages */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Database className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Messages</span>
            </div>
            <div className="text-lg font-semibold">
              {formatNumber(metrics.totalMessages)}
            </div>
          </div>

          {/* Code Artifacts */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Code Artifacts</span>
            </div>
            <div className="text-lg font-semibold text-blue-500">
              {metrics.codeArtifacts}
            </div>
          </div>
        </div>

        {/* Active Models */}
        {metrics.activeModels.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground">Active Models</span>
            <div className="flex flex-wrap gap-1">
              {metrics.activeModels.map(model => (
                <Badge key={model} variant="secondary" className="text-xs">
                  {model}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Token Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Token Usage</span>
            <span className="text-xs font-medium">
              {formatNumber(metrics.totalTokens)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            ~{formatNumber(Math.round(metrics.totalTokens * 0.75))} words processed
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PerformanceMetrics;