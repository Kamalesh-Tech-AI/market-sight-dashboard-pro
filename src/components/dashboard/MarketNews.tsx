import { ExternalLink, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface NewsItem {
  title: string;
  summary: string;
  time: string;
  source: string;
}

interface MarketNewsProps {
  news: NewsItem[];
}

export function MarketNews({ news }: MarketNewsProps) {
  return (
    <Card className="shadow-custom-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Market News
          <Button variant="outline" size="sm">
            View All
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {news.map((item, index) => (
          <div key={index} className="p-4 rounded-lg bg-accent/20 hover:bg-accent/40 transition-colors cursor-pointer">
            <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
              {item.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {item.summary}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium">{item.source}</span>
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {item.time}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}