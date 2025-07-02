import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, TrendingUp, TrendingDown, Plus, RefreshCw, Trash2, Star } from "lucide-react";
import { useWatchlistTrigger } from "@/hooks/useWatchlistTrigger";
import { useEffect, useState } from "react";

const Watchlist = () => {
  const { data, loading, error, triggerUpdate, refetch } = useWatchlistTrigger();
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
  const watchlistStocks = data?.stocks || [
    { symbol: "AAPL", name: "Apple Inc.", price: 189.95, change: 5.24, changePercent: 2.84, volume: "45.2M", marketCap: "2.98T", addedDate: "2024-01-10" },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: 145.80, change: 8.95, changePercent: 6.54, volume: "32.1M", marketCap: "1.85T", addedDate: "2024-01-08" },
    { symbol: "MSFT", name: "Microsoft Corporation", price: 428.15, change: 15.30, changePercent: 3.70, volume: "28.7M", marketCap: "3.18T", addedDate: "2024-01-05" },
    { symbol: "TSLA", name: "Tesla Inc", price: 248.50, change: 18.75, changePercent: 8.16, volume: "52.3M", marketCap: "789B", addedDate: "2024-01-03" },
    { symbol: "NVDA", name: "NVIDIA Corporation", price: 875.32, change: 42.15, changePercent: 5.07, volume: "38.9M", marketCap: "2.16T", addedDate: "2024-01-01" },
  ];

  const watchlistSummary = {
    totalStocks: watchlistStocks.length,
    gainers: watchlistStocks.filter(stock => stock.change > 0).length,
    losers: watchlistStocks.filter(stock => stock.change < 0).length,
    avgChange: watchlistStocks.reduce((sum, stock) => sum + stock.changePercent, 0) / watchlistStocks.length
  };

  const topMovers = [...watchlistStocks]
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    .slice(0, 3);

  return (
    <DashboardLayout>
      <>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Watchlist</h1>
              <p className="text-muted-foreground">Monitor your favorite stocks and track their performance</p>
            </div>
            <div className="flex items-center space-x-4">
              {lastRefresh && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    Last updated: {lastRefresh}
                  </Badge>
                  {data?.stocks && data.stocks.length > 0 && (
                    <Badge variant="default">
                      Live Watchlist
                    </Badge>
                  )}
                </div>
              )}
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stock
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
                Error loading watchlist: {error}
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

          {/* Watchlist Summary */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stocks</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{watchlistSummary.totalStocks}</div>
                <p className="text-xs text-muted-foreground">In your watchlist</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gainers</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{watchlistSummary.gainers}</div>
                <p className="text-xs text-muted-foreground">Stocks up today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Losers</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{watchlistSummary.losers}</div>
                <p className="text-xs text-muted-foreground">Stocks down today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Change</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${watchlistSummary.avgChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {watchlistSummary.avgChange >= 0 ? '+' : ''}{watchlistSummary.avgChange.toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground">Average performance</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Stocks</TabsTrigger>
              <TabsTrigger value="gainers">Gainers</TabsTrigger>
              <TabsTrigger value="losers">Losers</TabsTrigger>
              <TabsTrigger value="movers">Top Movers</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Your Watchlist</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Select defaultValue="name">
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="price">Price</SelectItem>
                          <SelectItem value="change">Change</SelectItem>
                          <SelectItem value="volume">Volume</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {watchlistStocks.map((stock) => (
                      <div key={stock.symbol} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-primary">{stock.symbol.slice(0, 2)}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold">{stock.symbol}</h3>
                            <p className="text-sm text-muted-foreground">{stock.name}</p>
                            <p className="text-xs text-muted-foreground">Added: {stock.addedDate}</p>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">${stock.price}</div>
                          <div className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.change >= 0 ? '+' : ''}${stock.change} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%)
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Volume</div>
                          <div className="font-medium">{stock.volume}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Market Cap</div>
                          <div className="font-medium">{stock.marketCap}</div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gainers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Gainers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {watchlistStocks
                      .filter(stock => stock.change > 0)
                      .sort((a, b) => b.changePercent - a.changePercent)
                      .map((stock) => (
                      <div key={stock.symbol} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{stock.symbol}</h3>
                            <p className="text-sm text-muted-foreground">{stock.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${stock.price}</div>
                          <div className="text-sm text-green-600">
                            +${stock.change} (+{stock.changePercent}%)
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="losers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Losers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {watchlistStocks
                      .filter(stock => stock.change < 0)
                      .sort((a, b) => a.changePercent - b.changePercent)
                      .map((stock) => (
                      <div key={stock.symbol} className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <TrendingDown className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{stock.symbol}</h3>
                            <p className="text-sm text-muted-foreground">{stock.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${stock.price}</div>
                          <div className="text-sm text-red-600">
                            ${stock.change} ({stock.changePercent}%)
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="movers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Movers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topMovers.map((stock, index) => (
                      <div key={stock.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                            {index + 1}
                          </div>
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-primary">{stock.symbol.slice(0, 2)}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold">{stock.symbol}</h3>
                            <p className="text-sm text-muted-foreground">{stock.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${stock.price}</div>
                          <div className={`text-sm font-medium ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.change >= 0 ? '+' : ''}${stock.change} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%)
                          </div>
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
              <span>Updating watchlist...</span>
            </div>
          </div>
        )}
      </>
    </DashboardLayout>
  );
};

export default Watchlist;
