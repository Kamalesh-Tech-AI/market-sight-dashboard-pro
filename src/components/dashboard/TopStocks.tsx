import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface TopStocksProps {
  stocks: Stock[];
  title: string;
}

export function TopStocks({ stocks, title }: TopStocksProps) {
  return (
    <Card className="shadow-custom-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stocks.map((stock, index) => {
          const isPositive = stock.change >= 0;
          return (
            <div key={stock.symbol} className="flex items-center justify-between p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                  {index + 1}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{stock.symbol}</div>
                  <div className="text-sm text-muted-foreground truncate max-w-[120px]">
                    {stock.name}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-foreground">
                  ${stock.price.toFixed(2)}
                </div>
                <div className={cn(
                  "flex items-center text-sm font-medium",
                  isPositive ? "text-success" : "text-destructive"
                )}>
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}