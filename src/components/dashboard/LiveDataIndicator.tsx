import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

interface LiveDataIndicatorProps {
  isConnected: boolean;
  lastUpdated?: string;
  isLoading?: boolean;
}

export function LiveDataIndicator({ isConnected, lastUpdated, isLoading }: LiveDataIndicatorProps) {
  return (
    <div className="flex items-center space-x-2">
      {isLoading ? (
        <Badge variant="secondary" className="animate-pulse">
          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
          Updating...
        </Badge>
      ) : isConnected ? (
        <Badge variant="default">
          <Wifi className="w-3 h-3 mr-1" />
          Live
        </Badge>
      ) : (
        <Badge variant="destructive">
          <WifiOff className="w-3 h-3 mr-1" />
          Offline
        </Badge>
      )}
      
      {lastUpdated && (
        <span className="text-xs text-muted-foreground">
          {new Date(lastUpdated).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
