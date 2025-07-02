import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search as SearchIcon, TrendingUp, TrendingDown, Star, Plus, Filter } from "lucide-react";
import { useSearchTrigger } from "@/hooks/useSearchTrigger";
import { useState, useEffect } from "react";

const Search = () => {
  const { data, loading, error, triggerSearch, refetch } = useSearchTrigger();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async (query: string) => {
    if (query.length > 2) {
      await triggerSearch(query);
    }
  };

  useEffect(() => {
    if (data?.results) {
      setSearchResults(data.results);
    }
  }, [data?.results]);

  // Mock data for demonstration
  const popularStocks = data?.popular || [
    { symbol: "AAPL", name: "Apple Inc.", price: 189.95, change: 5.24, changePercent: 2.84, sector: "Technology", marketCap: "2.98T" },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: 145.80, change: 8.95, changePercent: 6.54, sector: "Technology", marketCap: "1.85T" },
    { symbol: "MSFT", name: "Microsoft Corporation", price: 428.15, change: 15.30, changePercent: 3.70, sector: "Technology", marketCap: "3.18T" },
    { symbol: "TSLA", name: "Tesla Inc", price: 248.50, change: 18.75, changePercent: 8.16, sector: "Automotive", marketCap: "789B" },
    { symbol: "NVDA", name: "NVIDIA Corporation", price: 875.32, change: 42.15, changePercent: 5.07, sector: "Technology", marketCap: "2.16T" },
  ];

  const trendingStocks = data?.trending || [
    { symbol: "AMZN", name: "Amazon.com Inc", price: 178.25, change: 12.40, changePercent: 7.48, volume: "45.2M", reason: "Strong Q4 earnings" },
    { symbol: "META", name: "Meta Platforms Inc", price: 512.75, change: -28.45, changePercent: -5.26, volume: "32.1M", reason: "Regulatory concerns" },
    { symbol: "NFLX", name: "Netflix Inc", price: 485.20, change: -22.30, changePercent: -4.39, volume: "28.7M", reason: "Subscriber growth" },
  ];

  const sectors = [
    { name: "Technology", count: 156, performance: 12.4 },
    { name: "Healthcare", count: 89, performance: 8.7 },
    { name: "Finance", count: 67, performance: 6.2 },
    { name: "Energy", count: 45, performance: -2.1 },
    { name: "Consumer", count: 78, performance: 4.8 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Stock Search</h1>
            <p className="text-muted-foreground">Search and discover stocks, ETFs, and market data</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stocks by symbol, company name, or sector..."
                className="pl-10 text-lg h-12"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
              />
            </div>
            {loading && (
              <div className="mt-4 text-center text-muted-foreground">
                Searching...
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive text-sm">
              Error searching stocks: {error}
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

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {searchResults.map((stock, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-primary">{stock.symbol?.slice(0, 2)}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{stock.symbol}</h3>
                        <p className="text-sm text-muted-foreground">{stock.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${stock.price}</div>
                      <div className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.changePercent}%
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Star className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="popular" className="space-y-4">
          <TabsList>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="sectors">Sectors</TabsTrigger>
            <TabsTrigger value="etfs">ETFs</TabsTrigger>
          </TabsList>

          <TabsContent value="popular" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Popular Stocks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {popularStocks.map((stock) => (
                    <div key={stock.symbol} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-primary">{stock.symbol.slice(0, 2)}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{stock.symbol}</h3>
                          <p className="text-sm text-muted-foreground">{stock.name}</p>
                          <Badge variant="outline" className="text-xs">{stock.sector}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${stock.price}</div>
                        <div className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stock.change >= 0 ? '+' : ''}${stock.change} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%)
                        </div>
                        <div className="text-xs text-muted-foreground">{stock.marketCap}</div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Star className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Trending Stocks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trendingStocks.map((stock) => (
                    <div key={stock.symbol} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          {stock.change >= 0 ? (
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{stock.symbol}</h3>
                          <p className="text-sm text-muted-foreground">{stock.name}</p>
                          <p className="text-xs text-muted-foreground">{stock.reason}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${stock.price}</div>
                        <div className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stock.change >= 0 ? '+' : ''}${stock.change} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%)
                        </div>
                        <div className="text-xs text-muted-foreground">Vol: {stock.volume}</div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Star className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sectors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Market Sectors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {sectors.map((sector) => (
                    <div key={sector.name} className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                      <h3 className="font-semibold">{sector.name}</h3>
                      <p className="text-sm text-muted-foreground">{sector.count} stocks</p>
                      <div className={`text-sm font-medium ${sector.performance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {sector.performance >= 0 ? '+' : ''}{sector.performance}% today
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="etfs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Popular ETFs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { symbol: "SPY", name: "SPDR S&P 500 ETF", price: 485.20, change: 2.15, changePercent: 0.44, aum: "$450B" },
                    { symbol: "QQQ", name: "Invesco QQQ Trust", price: 398.75, change: -1.80, changePercent: -0.45, aum: "$220B" },
                    { symbol: "VTI", name: "Vanguard Total Stock Market", price: 245.30, change: 1.25, changePercent: 0.51, aum: "$1.3T" },
                  ].map((etf) => (
                    <div key={etf.symbol} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-blue-600">{etf.symbol.slice(0, 2)}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{etf.symbol}</h3>
                          <p className="text-sm text-muted-foreground">{etf.name}</p>
                          <Badge variant="secondary" className="text-xs">ETF</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${etf.price}</div>
                        <div className={`text-sm ${etf.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {etf.change >= 0 ? '+' : ''}${etf.change} ({etf.changePercent >= 0 ? '+' : ''}{etf.changePercent}%)
                        </div>
                        <div className="text-xs text-muted-foreground">AUM: {etf.aum}</div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Star className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Search;
