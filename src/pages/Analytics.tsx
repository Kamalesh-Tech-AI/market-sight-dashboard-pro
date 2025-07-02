import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Activity, Download, Calendar, DollarSign, RefreshCw } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter } from "recharts";
import { useAnalyticsTrigger } from "@/hooks/useAnalyticsTrigger";
import { useEffect, useState } from "react";

const Analytics = () => {
  const { data, loading, error, triggerUpdate, refetch } = useAnalyticsTrigger();
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
  const performanceMetrics = data?.performance ? {
    totalReturn: data.performance.total_return,
    annualizedReturn: data.performance.annualized_return,
    volatility: data.performance.volatility,
    alpha: data.performance.alpha
  } : {
    totalReturn: 31.8,
    annualizedReturn: 18.7,
    volatility: 22.5,
    alpha: 4.2
  };

  const sectorData = data?.sectorAllocation?.length > 0 ? data.sectorAllocation : [
    { sector: "Technology", percentage: 65, performance: 15.2, risk: 0.25 },
    { sector: "Healthcare", percentage: 15, performance: 8.7, risk: 0.18 },
    { sector: "Finance", percentage: 12, performance: 12.4, risk: 0.22 },
    { sector: "Energy", percentage: 8, performance: -2.1, risk: 0.35 },
  ];

  const correlationData = data?.correlations?.length > 0 ? 
    data.correlations.map(corr => ({
      name: `${corr.asset1} vs ${corr.asset2}`,
      correlation: corr.correlation
    })) : [
    { name: "AAPL vs MSFT", correlation: 0.72 },
    { name: "GOOGL vs AMZN", correlation: 0.68 },
    { name: "TSLA vs NVDA", correlation: 0.45 },
    { name: "Portfolio vs S&P", correlation: 0.85 },
  ];

  const performanceData = [
    { date: "Jan", portfolio: 95000, sp500: 92000, nasdaq: 89000 },
    { date: "Feb", portfolio: 98000, sp500: 94000, nasdaq: 91000 },
    { date: "Mar", portfolio: 102000, sp500: 96000, nasdaq: 94000 },
    { date: "Apr", portfolio: 108000, sp500: 98000, nasdaq: 97000 },
    { date: "May", portfolio: 115000, sp500: 101000, nasdaq: 102000 },
    { date: "Jun", portfolio: 125432, sp500: 105000, nasdaq: 108000 },
  ];

  const volatilityData = [
    { stock: "AAPL", volatility: 0.25, returns: 0.12 },
    { stock: "GOOGL", volatility: 0.30, returns: 0.15 },
    { stock: "MSFT", volatility: 0.22, returns: 0.10 },
    { stock: "TSLA", volatility: 0.45, returns: 0.08 },
    { stock: "NVDA", volatility: 0.35, returns: 0.18 },
  ];

  const riskMetrics = [
    { metric: "Portfolio Beta", value: data?.performance?.beta?.toFixed(2) || "1.15", description: "15% more volatile than market" },
    { metric: "Sharpe Ratio", value: data?.performance?.sharpe_ratio?.toFixed(2) || "1.42", description: "Good risk-adjusted returns" },
    { metric: "Max Drawdown", value: `${data?.performance?.max_drawdown?.toFixed(1) || "-8.3"}%`, description: "Largest peak-to-trough decline" },
    { metric: "VaR (95%)", value: `$${data?.performance?.var_95?.toLocaleString() || "3,250"}`, description: "Daily value at risk" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Advanced portfolio analytics and performance insights</p>
          </div>
          <div className="flex items-center space-x-4">
            {lastRefresh && (
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  Last updated: {lastRefresh}
                </Badge>
                {data?.performance && (
                  <Badge variant="default">
                    Live Analytics
                  </Badge>
                )}
              </div>
            )}
            <div className="flex space-x-2">
              <Select defaultValue="6m">
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">1 Month</SelectItem>
                  <SelectItem value="3m">3 Months</SelectItem>
                  <SelectItem value="6m">6 Months</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
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
              Error loading analytics: {error}
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

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Return</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+{performanceMetrics.totalReturn}%</div>
              <p className="text-xs text-muted-foreground">vs S&P 500: +14.2%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annualized Return</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceMetrics.annualizedReturn}%</div>
              <p className="text-xs text-muted-foreground">Above benchmark</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Volatility</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceMetrics.volatility}%</div>
              <p className="text-xs text-muted-foreground">Moderate risk level</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alpha</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+{performanceMetrics.alpha}%</div>
              <p className="text-xs text-muted-foreground">Outperforming market</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
            <TabsTrigger value="sectors">Sector Analysis</TabsTrigger>
            <TabsTrigger value="correlation">Correlation</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio vs Benchmarks</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                      <Line type="monotone" dataKey="portfolio" stroke="#3b82f6" strokeWidth={3} name="Portfolio" />
                      <Line type="monotone" dataKey="sp500" stroke="#10b981" strokeWidth={2} name="S&P 500" />
                      <Line type="monotone" dataKey="nasdaq" stroke="#f59e0b" strokeWidth={2} name="NASDAQ" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Returns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="portfolio" fill="#3b82f6" name="Monthly Return %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Best Month</span>
                      <span className="font-semibold text-green-600">+8.7%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Worst Month</span>
                      <span className="font-semibold text-red-600">-3.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Win Rate</span>
                      <span className="font-semibold">73%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Monthly Return</span>
                      <span className="font-semibold">+2.1%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Information Ratio</span>
                      <span className="font-semibold">0.68</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="risk" className="space-y-4">
            <div className="grid gap-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {riskMetrics.map((metric) => (
                      <div key={metric.metric} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{metric.metric}</span>
                          <span className="font-semibold">{metric.value}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{metric.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Risk vs Return</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <ScatterChart data={volatilityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="volatility" name="Volatility" />
                        <YAxis dataKey="returns" name="Returns" />
                        <Tooltip formatter={(value, name) => [
                          name === "volatility" ? `${(Number(value) * 100).toFixed(1)}%` : `${(Number(value) * 100).toFixed(1)}%`,
                          name === "volatility" ? "Volatility" : "Returns"
                        ]} />
                        <Scatter dataKey="returns" fill="#3b82f6" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Drawdown Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="portfolio" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sectors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sector Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sectorData.map((sector) => (
                    <div key={sector.sector} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="font-medium">{sector.sector}</div>
                      <div className="flex space-x-4 text-sm">
                        <div className="text-center">
                          <div className="text-muted-foreground">Allocation</div>
                          <div className="font-semibold">{sector.percentage}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">Performance</div>
                          <div className={`font-semibold ${sector.performance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {sector.performance >= 0 ? '+' : ''}{sector.performance}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">Risk</div>
                          <div className="font-semibold">{(sector.risk * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="correlation" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Asset Correlations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {correlationData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <span className="text-sm">{item.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.abs(item.correlation) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-12">{item.correlation.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Diversification Score</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600">7.2</div>
                    <p className="text-sm text-muted-foreground">out of 10</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Asset Diversification</span>
                      <Badge variant="default">Good</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Sector Diversification</span>
                      <Badge variant="secondary">Moderate</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Geographic Diversification</span>
                      <Badge variant="destructive">Low</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {loading && (
          <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Updating analytics...</span>
            </div>
          </div>
        </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
