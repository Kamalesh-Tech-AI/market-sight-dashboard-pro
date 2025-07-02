import { DollarSign, TrendingUp, BarChart3, Users } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { StockChart } from "@/components/dashboard/StockChart";
import { TopStocks } from "@/components/dashboard/TopStocks";
import { MarketNews } from "@/components/dashboard/MarketNews";
import { PredictionCard } from "@/components/dashboard/PredictionCard";
import { portfolioMetrics, stockChartData, topGainers, topLosers, marketNews, predictions } from "@/data/mockData";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your portfolio overview.</p>
      </div>

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
          value="24"
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
          <TopStocks stocks={topGainers.slice(0, 5)} title="Top Gainers" />
        </div>
      </div>

      {/* Predictions and News */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-6 md:grid-cols-2">
          {predictions.slice(0, 4).map((pred) => (
            <PredictionCard key={pred.symbol} prediction={pred} />
          ))}
        </div>
        <MarketNews news={marketNews} />
      </div>
    </div>
  );
}