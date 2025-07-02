import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease" | "neutral";
  icon: ReactNode;
  subtitle?: string;
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon, 
  subtitle 
}: MetricCardProps) {
  const changeColor = {
    increase: "text-success",
    decrease: "text-destructive",
    neutral: "text-neutral",
  }[changeType];

  const changeBg = {
    increase: "bg-success-light",
    decrease: "bg-destructive-light",
    neutral: "bg-muted",
  }[changeType];

  return (
    <Card className="relative overflow-hidden bg-gradient-card shadow-custom-md hover:shadow-custom-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-primary opacity-70">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground mb-1">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mb-2">
            {subtitle}
          </p>
        )}
        <div className="flex items-center space-x-2">
          <span className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            changeBg,
            changeColor
          )}>
            {change}
          </span>
          <span className="text-xs text-muted-foreground">
            vs last period
          </span>
        </div>
      </CardContent>
    </Card>
  );
}