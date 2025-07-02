import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Target, Brain, Calendar, Filter, RefreshCw } from "lucide-react";
import { PredictionCard } from "@/components/dashboard/PredictionCard";
import { usePredictionsTrigger } from "@/hooks/usePredictionsTrigger";
import { useEffect, useState } from "react";

const Predictions = () => {
  const { data, loading, error, triggerUpdate, refetch } = usePredictionsTrigger();
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

  // Transform real-time data for display
  const realTimePredictions = data?.predictions?.slice(0, 6).map(pred => ({
    symbol: pred.symbol,
    prediction: pred.direction,
    confidence: pred.confidence,
    targetPrice: pred.target_price,
    currentPrice: 0, // This would come from stocks table
    timeframe: pred.timeframe,
    accuracy: pred.accuracy
  })) || [];

  // Fallback predictions if no real-time data
  const fallbackPredictions = [
    { symbol: "AAPL", prediction: "BUY" as const, confidence: 85, targetPrice: 195.50, currentPrice: 189.95, timeframe: "1 week", accuracy: 78 },
    { symbol: "GOOGL", prediction: "HOLD" as const, confidence: 72, targetPrice: 148.20, currentPrice: 145.80, timeframe: "2 weeks", accuracy: 82 },
    { symbol: "MSFT", prediction: "BUY" as const, confidence: 78, targetPrice: 445.00, currentPrice: 428.15, timeframe: "1 month", accuracy: 75 },
    { symbol: "TSLA", prediction: "SELL" as const, confidence: 68, targetPrice: 235.00, currentPrice: 248.50, timeframe: "3 days", accuracy: 71 },
    { symbol: "NVDA", prediction: "HOLD" as const, confidence: 81, targetPrice: 890.00, currentPrice: 875.32, timeframe: "2 weeks", accuracy: 85 },
    { symbol: "AMZN", prediction: "BUY" as const, confidence: 76, targetPrice: 185.00, currentPrice: 178.25, timeframe: "1 week", accuracy: 79 },
  ];

  const predictions = realTimePredictions.length > 0 ? realTimePredictions : fallbackPredictions;

  const modelPerformance = data?.modelPerformance?.length > 0 ? data.modelPerformance.map(model => ({
    model: model.model_name,
    accuracy: model.accuracy,
    predictions: model.total_predictions
  })) : [
    { model: "Neural Network", accuracy: 78.5, predictions: 1250 },
    { model: "Random Forest", accuracy: 75.2, predictions: 980 },
    { model: "LSTM", accuracy: 82.1, predictions: 750 },
    { model: "Ensemble", accuracy: 84.3, predictions: 2100 },
  ];

  const recentPredictions = [
    { symbol: "AAPL", predicted: 185.50, actual: 189.95, date: "2024-01-10", status: "correct" },
    { symbol: "TSLA", predicted: 245.00, actual: 248.50, date: "2024-01-09", status: "correct" },
    { symbol: "GOOGL", predicted: 150.00, actual: 145.80, date: "2024-01-08", status: "incorrect" },
    { symbol: "MSFT", predicted: 425.00, actual: 428.15, date: "2024-01-07", status: "correct" },
  ];

  return (
    <DashboardLayout>
      <>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">AI Predictions</h1>
              <p className="text-muted-foreground">AI-powered stock price predictions and market insights</p>
            </div>
            <div className="flex items-center space-x-4">
              {lastRefresh && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    Last updated: {lastRefresh}
                  </Badge>
                  {data?.predictions && data.predictions.length > 0 && (
                    <Badge variant="default">
                      Live Predictions
                    </Badge>
                  )}
                </div>
              )}
              <div className="flex space-x-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stocks</SelectItem>
                    <SelectItem value="buy">Buy Signals</SelectItem>
                    <SelectItem value="sell">Sell Signals</SelectItem>
                    <SelectItem value="hold">Hold Signals</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
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
                Error loading predictions: {error}
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

          {/* Model Performance Overview */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Accuracy</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {modelPerformance.length > 0 ? `${Math.max(...modelPerformance.map(m => m.accuracy)).toFixed(1)}%` : '84.3%'}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+2.1%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Predictions</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{predictions.length}</div>
                <p className="text-xs text-muted-foreground">Updated hourly</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Buy Signals</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {predictions.filter(p => p.prediction === "BUY").length}
                </div>
                <p className="text-xs text-muted-foreground">Strong buy opportunities</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sell Signals</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {predictions.filter(p => p.prediction === "SELL").length}
                </div>
                <p className="text-xs text-muted-foreground">Consider selling</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="predictions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="predictions">Current Predictions</TabsTrigger>
              <TabsTrigger value="performance">Model Performance</TabsTrigger>
              <TabsTrigger value="history">Prediction History</TabsTrigger>
            </TabsList>

            <TabsContent value="predictions" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {predictions.map((prediction) => (
                  <div key={prediction.symbol} className="relative">
                    <PredictionCard prediction={prediction} />
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        {prediction.timeframe}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Model Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {modelPerformance.map((model) => (
                      <div key={model.model} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{model.model}</span>
                          <span className="text-sm text-muted-foreground">{model.accuracy}%</span>
                        </div>
                        <Progress value={model.accuracy} className="h-2" />
                        <p className="text-xs text-muted-foreground">{model.predictions} predictions made</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Accuracy Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">This Week</span>
                        <span className="font-semibold text-green-600">+3.2%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">This Month</span>
                        <span className="font-semibold text-green-600">+2.1%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Last 3 Months</span>
                        <span className="font-semibold text-green-600">+5.7%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Best Performing</span>
                        <span className="font-semibold">
                          {modelPerformance.length > 0 ? 
                            modelPerformance.reduce((prev, current) => 
                              (prev.accuracy > current.accuracy) ? prev : current
                            ).model : 'Ensemble Model'
                          }
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Prediction Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentPredictions.map((pred, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-primary">{pred.symbol.slice(0, 2)}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold">{pred.symbol}</h3>
                            <p className="text-sm text-muted-foreground">{pred.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">
                            Predicted: <span className="font-medium">${pred.predicted}</span>
                          </div>
                          <div className="text-sm">
                            Actual: <span className="font-medium">${pred.actual}</span>
                          </div>
                        </div>
                        <Badge variant={pred.status === "correct" ? "default" : "destructive"}>
                          {pred.status}
                        </Badge>
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
              <span>Updating predictions...</span>
            </div>
          </div>
        )}
      </>
    </DashboardLayout>
  );
};

export default Predictions;
