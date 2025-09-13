import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Wifi, WifiOff, Clock, CheckCircle, AlertCircle, Zap } from 'lucide-react';

interface StatusIndicatorProps {
  isOnline?: boolean;
  isLoading?: boolean;
  lastSeen?: Date;
  responseTime?: number;
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isOnline = true,
  isLoading = false,
  lastSeen,
  responseTime,
  className
}) => {
  const getStatusColor = () => {
    if (isLoading) return 'bg-yellow-500';
    if (isOnline) return 'bg-green-500';
    return 'bg-red-500';
  };

  const getStatusIcon = () => {
    if (isLoading) return <Clock className="h-3 w-3" />;
    if (isOnline) return <Wifi className="h-3 w-3" />;
    return <WifiOff className="h-3 w-3" />;
  };

  const getStatusText = () => {
    if (isLoading) return 'Processing...';
    if (isOnline) return 'Online';
    return 'Offline';
  };

  const getStatusMessage = () => {
    if (isLoading) return 'AI is processing your request';
    if (isOnline) {
      let message = 'AI is ready to assist';
      if (responseTime) {
        message += ` • Average response: ${responseTime}ms`;
      }
      if (lastSeen) {
        message += ` • Last active: ${lastSeen.toLocaleTimeString()}`;
      }
      return message;
    }
    return 'AI is currently unavailable';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className={`flex items-center gap-2 ${className}`}>
            <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${
              isLoading ? 'animate-pulse' : ''
            }`} />
            
            <Badge 
              variant="secondary" 
              className="text-xs flex items-center gap-1"
            >
              {getStatusIcon()}
              {getStatusText()}
            </Badge>

            {responseTime && responseTime < 1000 && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Zap className="h-3 w-3 text-yellow-500" />
                Fast
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{getStatusMessage()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default StatusIndicator;