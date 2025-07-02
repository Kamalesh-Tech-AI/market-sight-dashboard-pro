// Mock data for the dashboard
export const portfolioMetrics = {
  totalValue: "$125,432.18",
  dailyChange: "+$2,431.50",
  dailyChangePercent: "+1.97%",
  weeklyChange: "+$8,234.20",
  weeklyChangePercent: "+7.02%",
  totalGain: "+$32,156.78",
  totalGainPercent: "+34.48%",
};

export const stockChartData = [
  { date: "Jan 1", price: 150.25, prediction: 148.50 },
  { date: "Jan 2", price: 152.10, prediction: 151.20 },
  { date: "Jan 3", price: 148.75, prediction: 149.80 },
  { date: "Jan 4", price: 151.30, prediction: 152.10 },
  { date: "Jan 5", price: 155.20, prediction: 154.50 },
  { date: "Jan 6", price: 158.90, prediction: 157.30 },
  { date: "Jan 7", price: 156.40, prediction: 159.20 },
  { date: "Jan 8", price: 162.15, prediction: 161.80 },
  { date: "Jan 9", price: 165.30, prediction: 164.90 },
  { date: "Jan 10", price: 168.75, prediction: 167.40 },
  { date: "Jan 11", price: 171.20, prediction: 170.50 },
  { date: "Jan 12", price: 169.85, prediction: 172.30 },
  { date: "Jan 13", price: 174.50, prediction: 173.80 },
  { date: "Jan 14", price: 177.90, prediction: 176.20 },
  { date: "Jan 15", price: 180.25, prediction: 179.50 },
];

export const topGainers = [
  { symbol: "NVDA", name: "NVIDIA Corporation", price: 875.32, change: 42.15, changePercent: 5.07 },
  { symbol: "TSLA", name: "Tesla Inc", price: 248.50, change: 18.75, changePercent: 8.16 },
  { symbol: "AMZN", name: "Amazon.com Inc", price: 178.25, change: 12.40, changePercent: 7.48 },
  { symbol: "GOOGL", name: "Alphabet Inc", price: 145.80, change: 8.95, changePercent: 6.54 },
  { symbol: "MSFT", name: "Microsoft Corporation", price: 428.15, change: 15.30, changePercent: 3.70 },
];

export const topLosers = [
  { symbol: "META", name: "Meta Platforms Inc", price: 512.75, change: -28.45, changePercent: -5.26 },
  { symbol: "NFLX", name: "Netflix Inc", price: 485.20, change: -22.30, changePercent: -4.39 },
  { symbol: "AAPL", name: "Apple Inc", price: 189.95, change: -7.85, changePercent: -3.97 },
  { symbol: "AMD", name: "Advanced Micro Devices", price: 138.40, change: -5.20, changePercent: -3.62 },
  { symbol: "INTC", name: "Intel Corporation", price: 42.85, change: -1.45, changePercent: -3.27 },
];

export const watchlistStocks = [
  { symbol: "SPY", name: "SPDR S&P 500 ETF", price: 485.20, change: 2.15, changePercent: 0.44 },
  { symbol: "QQQ", name: "Invesco QQQ Trust", price: 398.75, change: -1.80, changePercent: -0.45 },
  { symbol: "VTI", name: "Vanguard Total Stock Market", price: 245.30, change: 1.25, changePercent: 0.51 },
  { symbol: "BTC-USD", name: "Bitcoin USD", price: 67840.25, change: 1245.80, changePercent: 1.87 },
];

export const predictions = [
  { symbol: "AAPL", prediction: "BUY" as const, confidence: 85, targetPrice: 195.50, currentPrice: 189.95 },
  { symbol: "GOOGL", prediction: "HOLD" as const, confidence: 72, targetPrice: 148.20, currentPrice: 145.80 },
  { symbol: "MSFT", prediction: "BUY" as const, confidence: 78, targetPrice: 445.00, currentPrice: 428.15 },
  { symbol: "TSLA", prediction: "SELL" as const, confidence: 68, targetPrice: 235.00, currentPrice: 248.50 },
  { symbol: "NVDA", prediction: "HOLD" as const, confidence: 81, targetPrice: 890.00, currentPrice: 875.32 },
];

export const marketNews = [
  {
    title: "AI Stocks Rally as Tech Giants Report Strong Quarterly Earnings",
    summary: "Major technology companies exceeded expectations in their latest earnings reports, driving significant gains in AI-related stocks.",
    time: "2 hours ago",
    source: "MarketWatch"
  },
  {
    title: "Federal Reserve Hints at Potential Interest Rate Cuts",
    summary: "Recent statements from Fed officials suggest a more dovish approach to monetary policy in the coming months.",
    time: "4 hours ago",
    source: "Reuters"
  },
  {
    title: "Electric Vehicle Sales Surge Despite Market Volatility",
    summary: "EV manufacturers report record sales figures, showing resilience in the face of broader market uncertainty.",
    time: "6 hours ago",
    source: "Bloomberg"
  },
];