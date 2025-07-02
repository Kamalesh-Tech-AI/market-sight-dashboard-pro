import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, DollarSign, PieChart, Plus, RefreshCw, Download } from "lucide-react";
import { ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";
import { usePortfolioTrigger } from "@/hooks/usePortfolioTrigger";
import { useEffect, useState } from "react";

const Portfolio = () => {
  const { data, loading, error, triggerUpdate, refetch } = usePortfolioTrigger();
  const [lastRefresh, setLastRefresh] = useState<string>('');

  useEffect(() => {
    // Auto-trigger on component mount
    triggerUpdate();
  }, []);

  useEffect(() => {
    if (data?.lastUpdated) {
      setLastRefresh(new Date(data.lastUpdated).toLocaleTimeString());
    }
  }, [data?.lastUpdated]);

  const handleManualRefresh = async () => {
    await triggerUpdate();
  };

  // Use real-time data if available, otherwise fallback to mock data
  const portfolioHoldings = data?.holdings || [
    { symbol: "AAPL", name: "Apple Inc.", shares: 50, avgPrice: 150.25, currentPrice: 189.95, value: 9497.50, gainLoss: 1985.00, gainLossPercent: 26.4 },
    { symbol: "GOOGL", name: "Alphabet Inc.", shares: 25, avgPrice: 120.50, currentPrice: 145.80, value: 3645.00, gainLoss: 632.50, gainLossPercent: 21.0 },
    { symbol: "MSFT", name: "Microsoft Corporation", shares: 30, avgPrice: 380.00, currentPrice: 428.15, value: 12844.50, gainLoss: 1444.50, gainLossPercent: 12.7 },
    { symbol: "TSLA", name: "Tesla Inc", shares: 15, avgPrice: 220.00, currentPrice: 248.50, value: 3727.50, gainLoss: 427.50, gainLossPercent: 12.9 },
    { symbol: "NVDA", name: "NVIDIA Corporation", shares: 10, avgPrice: 750.00, currentPrice: 875.32, value: 8753.20, gainLoss: 1253.20, gainLossPercent: 16.7 },
  ];

  const portfolioSummary = data?.summary || {
    totalValue: 38467.70,
    totalCost: 32825.00,
    totalGainLoss: 5642.70,
    totalGainLossPercent: 17.2,
    dayChange: 1247.85,
    dayChangePercent: 3.35
  };

  const recentTransactions = data?.transactions || [
    { id: 1, type: "BUY", symbol: "AAPL", shares: 10, price: 189.95, date: "2024-01-15", total: 1899.50 },
    { id: 2, type: "SELL", symbol: "TSLA", shares: 5, price: 248.50, date: "2024-01-14", total: 1242.50 },
    { id: 3, type: "BUY", symbol: "NVDA", shares: 2, price: 875.32, date: "2024-01-13", total: 1750.64 },
    { id: 4, type: "BUY", symbol: "GOOGL", shares: 5, price: 145.80, date: "2024-01-12", total: 729.00 },
  ];

  const allocationData = portfolioHoldings.map(holding => ({
    name: holding.symbol,
    value: holding.value,
    percentage: ((holding.value / portfolioSummary.totalValue) * 100).toFixed(1)
  }));

  const performanceData = [
    { date: "Jan 1", value: 32825 },
    { date: "Jan 5", value: 34200 },
    { date: "Jan 10", value: 36500 },
    { date: "Jan 15", value: 38467 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <DashboardLayout>
      <>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Portfolio</h1>
              <p className="text-muted-foreground">Track your investments and portfolio performance</p>
            </div>
            <div className="flex items-center space-x-4">
              {lastRefresh && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    Last updated: {lastRefresh}
                  </Badge>
                  {data?.holdings && data.holdings.length > 0 && (
                    <Badge variant="default">
                      Live Portfolio
                    </Badge>
                  )}
                </div>
              )}
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Position
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
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
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive text-sm">
                Error loading portfolio: {error}
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

          {/* Portfolio Summary */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${portfolioSummary.totalValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Portfolio value</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${portfolioSummary.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {portfolioSummary.totalGainLoss >= 0 ? '+' : ''}${portfolioSummary.totalGainLoss.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {portfolioSummary.totalGainLossPercent >= 0 ? '+' : ''}{portfolioSummary.totalGainLossPercent}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Day Change</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${portfolioSummary.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {portfolioSummary.dayChange >= 0 ? '+' : ''}${portfolioSummary.dayChange.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {portfolioSummary.dayChangePercent >= 0 ? '+' : ''}{portfolioSummary.dayChangePercent}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Holdings</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{portfolioHoldings.length}</div>
                <p className="text-xs text-muted-foreground">Active positions</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="holdings" className="space-y-4">
            <TabsList>
              <TabsTrigger value="holdings">Holdings</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="allocation">Allocation</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="holdings" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Current Holdings</CardTitle>
                    <Select defaultValue="value">
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="value">Value</SelectItem>
                        <SelectItem value="gainloss">Gain/Loss</SelectItem>
                        <SelectItem value="symbol">Symbol</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {portfolioHoldings.map((holding) => (
                      <div key={holding.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-primary">{holding.symbol.slice(0, 2)}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold">{holding.symbol}</h3>
                            <p className="text-sm text-muted-foreground">{holding.name}</p>
                            <p className="text-xs text-muted-foreground">{holding.shares} shares @ ${holding.avgPrice}</p>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">${holding.currentPrice}</div>
                          <div className="text-sm text-muted-foreground">Current Price</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">${holding.value.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Market Value</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${holding.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {holding.gainLoss >= 0 ? '+' : ''}${holding.gainLoss.toLocaleString()}
                          </div>
                          <div className={`text-sm ${holding.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {holding.gainLossPercent >= 0 ? '+' : ''}{holding.gainLossPercent}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Portfolio Value']} />
                      <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="allocation" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio Allocation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={allocationData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percentage }) => `${name} ${percentage}%`}
                        >
                          {allocationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Value']} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Allocation Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {allocationData.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{item.percentage}%</div>
                          <div className="text-sm text-muted-foreground">${Number(item.value).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Badge variant={transaction.type === 'BUY' ? 'default' : 'secondary'}>
                            {transaction.type}
                          </Badge>
                          <div>
                            <h3 className="font-semibold">{transaction.symbol}</h3>
                            <p className="text-sm text-muted-foreground">{transaction.date}</p>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{transaction.shares} shares</div>
                          <div className="text-sm text-muted-foreground">@ ${transaction.price}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${transaction.total.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Total</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {loading && (
          <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Updating portfolio...</span>
            </div>
          </div>
        )}
      </>
    </DashboardLayout>
  );
};

export default Portfolio;import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

const Portfolio = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Portfolio</h1>
        <p className="text-muted-foreground">Portfolio page coming soon...</p>
      </div>
    </DashboardLayout>
  );
};

export default Portfolio;
