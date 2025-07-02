import { DollarSign, TrendingUp, BarChart3, Users, RefreshCw } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { StockChart } from "@/components/dashboard/StockChart";
import { TopStocks } from "@/components/dashboard/TopStocks";
import { MarketNews } from "@/components/dashboard/MarketNews";
import { PredictionCard } from "@/components/dashboard/PredictionCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDashboardTrigger } from "@/hooks/useDashboardTrigger";
import { portfolioMetrics, stockChartData, marketNews } from "@/data/mockData";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { data, loading, error, triggerUpdate, refetch } = useDashboardTrigger();
  const [lastRefresh, setLastRefresh] = useState<string>('');

  useEffect(() => {
    if (data?.lastUpdated) {
      setLastRefresh(new Date(data.lastUpdated).toLocaleTimeString());
    }
  }, [data?.lastUpdated]);

  // Transform real-time data for display
  const realTimeStocks = data?.stocks?.slice(0, 5).map(stock => ({
    symbol: stock.symbol,
    name: stock.name,
    price: stock.price,
    change: stock.change,
    changePercent: stock.change_percent
  })) || [];

  const realTimePredictions = data?.predictions?.slice(0, 4).map(pred => ({
    symbol: pred.symbol,
    prediction: pred.direction,
    confidence: pred.confidence,
    targetPrice: pred.target_price,
    currentPrice: data.stocks.find(s => s.symbol === pred.symbol)?.price || 0
  })) || [];

  const handleManualRefresh = async () => {
    await triggerUpdate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your portfolio overview.</p>
        </div>
        <div className="flex items-center space-x-4">
          {lastRefresh && (
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                Last updated: {lastRefresh}
              </Badge>
              {data?.stocks && data.stocks.length > 0 && (
                <Badge variant="default">
                  Live Data
                </Badge>
              )}
            </div>
          )}
          <Button 
            variant="outline" 
            onClick={handleManualRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Updating...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive text-sm">
            Error loading real-time data: {error}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refetch}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Portfolio Value"
          value={portfolioMetrics.totalValue}
          change={portfolioMetrics.dailyChangePercent}
          changeType="increase"
          icon={<DollarSign className="h-4 w-4" />}
          subtitle="Total investment value"
        />
        <MetricCard
          title="Daily P&L"
          value={portfolioMetrics.dailyChange}
          change={portfolioMetrics.dailyChangePercent}
          changeType="increase"
          icon={<TrendingUp className="h-4 w-4" />}
          subtitle="Today's performance"
        />
        <MetricCard
          title="Total Gain/Loss"
          value={portfolioMetrics.totalGain}
          change={portfolioMetrics.totalGainPercent}
          changeType="increase"
          icon={<BarChart3 className="h-4 w-4" />}
          subtitle="All-time performance"
        />
        <MetricCard
          title="Active Positions"
          value={data?.stocks?.length?.toString() || "24"}
          change="+2 this week"
          changeType="increase"
          icon={<Users className="h-4 w-4" />}
          subtitle="Currently held stocks"
        />
      </div>

      {/* Charts and Lists */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StockChart data={stockChartData} title="Portfolio Performance vs Predictions" />
        </div>
        <div className="space-y-6">
          <TopStocks 
            stocks={realTimeStocks.length > 0 ? realTimeStocks : [
              { symbol: "NVDA", name: "NVIDIA Corporation", price: 875.32, change: 42.15, changePercent: 5.07 },
              { symbol: "TSLA", name: "Tesla Inc", price: 248.50, change: 18.75, changePercent: 8.16 },
              { symbol: "AMZN", name: "Amazon.com Inc", price: 178.25, change: 12.40, changePercent: 7.48 },
              { symbol: "GOOGL", name: "Alphabet Inc", price: 145.80, change: 8.95, changePercent: 6.54 },
              { symbol: "MSFT", name: "Microsoft Corporation", price: 428.15, change: 15.30, changePercent: 3.70 }
            ]} 
            title={realTimeStocks.length > 0 ? "Live Stock Data" : "Top Gainers"} 
          />
        </div>
      </div>

      {/* Predictions and News */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-6 md:grid-cols-2">
          {realTimePredictions.length > 0 ? (
            realTimePredictions.map((pred) => (
              <PredictionCard key={pred.symbol} prediction={pred} />
            ))
          ) : (
            // Fallback to mock data if no real-time predictions
            [
              { symbol: "AAPL", prediction: "BUY" as const, confidence: 85, targetPrice: 195.50, currentPrice: 189.95 },
              { symbol: "GOOGL", prediction: "HOLD" as const, confidence: 72, targetPrice: 148.20, currentPrice: 145.80 },
              { symbol: "MSFT", prediction: "BUY" as const, confidence: 78, targetPrice: 445.00, currentPrice: 428.15 },
              { symbol: "TSLA", prediction: "SELL" as const, confidence: 68, targetPrice: 235.00, currentPrice: 248.50 }
            ].map((pred) => (
              <PredictionCard key={pred.symbol} prediction={pred} />
            ))
          )}
        </div>
        <MarketNews news={marketNews} />
      </div>

      {loading && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Updating live data...</span>
          </div>
        </div>
      )}
    </div>
  );
}
