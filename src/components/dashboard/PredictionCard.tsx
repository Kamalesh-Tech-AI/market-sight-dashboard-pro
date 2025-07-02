import { TrendingUp, TrendingDown, Minus, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Prediction {
  symbol: string;
  prediction: "BUY" | "SELL" | "HOLD";
  confidence: number;
  targetPrice: number;
  currentPrice: number;
}

interface PredictionCardProps {
  prediction: Prediction;
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  const { symbol, prediction: pred, confidence, targetPrice, currentPrice } = prediction;
  
  const potentialGain = ((targetPrice - currentPrice) / currentPrice) * 100;
  const isPositiveGain = potentialGain >= 0;
  
  const predictionConfig = {
    BUY: {
      color: "bg-success text-success-foreground",
      icon: TrendingUp,
      textColor: "text-success"
    },
    SELL: {
      color: "bg-destructive text-destructive-foreground",
      icon: TrendingDown,
      textColor: "text-destructive"
    },
    HOLD: {
      color: "bg-warning text-warning-foreground",
      icon: Minus,
      textColor: "text-warning"
    }
  };

  const config = predictionConfig[pred];
  const Icon = config.icon;

  return (
    <Card className="shadow-custom-md hover:shadow-custom-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">{symbol}</CardTitle>
          <Badge className={config.color}>
            <Icon className="w-3 h-3 mr-1" />
            {pred}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Current</p>
            <p className="text-xl font-semibold">${currentPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Target</p>
            <p className="text-xl font-semibold">${targetPrice.toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Confidence</span>
            <span className="text-sm font-medium">{confidence}%</span>
          </div>
          <Progress value={confidence} className="h-2" />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-accent/20">
          <div className="flex items-center">
            <Target className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Potential</span>
          </div>
          <span className={cn(
            "text-sm font-semibold",
            isPositiveGain ? "text-success" : "text-destructive"
          )}>
            {isPositiveGain ? "+" : ""}{potentialGain.toFixed(2)}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}