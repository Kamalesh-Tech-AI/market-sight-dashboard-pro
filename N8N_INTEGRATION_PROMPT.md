# StockIQ Dashboard - Complete N8N Integration Guide

## Overview
This document provides comprehensive instructions for setting up N8N workflows to integrate with the StockIQ Dashboard. The dashboard includes 8 different trigger endpoints that can be used to create automated workflows for real-time stock data, portfolio management, predictions, analytics, and notifications.

## Architecture
```
StockIQ Dashboard → Supabase Edge Functions → N8N Webhooks → External APIs → Database Updates → Real-time UI Updates
```

## Environment Setup

### Supabase Secrets Configuration
Add these secrets in your Supabase project dashboard under Settings > Edge Functions:

```bash
# Main Dashboard Trigger
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/dashboard-trigger

# Specialized Triggers
N8N_PORTFOLIO_WEBHOOK_URL=https://your-n8n-instance.com/webhook/portfolio-trigger
N8N_PREDICTIONS_WEBHOOK_URL=https://your-n8n-instance.com/webhook/predictions-trigger
N8N_ANALYTICS_WEBHOOK_URL=https://your-n8n-instance.com/webhook/analytics-trigger
N8N_ALERTS_WEBHOOK_URL=https://your-n8n-instance.com/webhook/alerts-trigger
N8N_SEARCH_WEBHOOK_URL=https://your-n8n-instance.com/webhook/search-trigger
N8N_WATCHLIST_WEBHOOK_URL=https://your-n8n-instance.com/webhook/watchlist-trigger
N8N_SETTINGS_WEBHOOK_URL=https://your-n8n-instance.com/webhook/settings-trigger
N8N_NOTIFICATION_WEBHOOK_URL=https://your-n8n-instance.com/webhook/notification-trigger
```

## Database Schema

### Core Tables
```sql
-- Stocks table (main stock data)
CREATE TABLE stocks (
  symbol text PRIMARY KEY,
  name text NOT NULL,
  price decimal(10,2) NOT NULL DEFAULT 0,
  change decimal(10,2) NOT NULL DEFAULT 0,
  change_percent decimal(5,2) NOT NULL DEFAULT 0,
  volume text,
  market_cap text,
  sector text,
  updated_at timestamptz DEFAULT now()
);

-- Predictions table (AI predictions)
CREATE TABLE predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL REFERENCES stocks(symbol),
  direction text NOT NULL CHECK (direction IN ('BUY', 'SELL', 'HOLD')),
  confidence integer NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  target_price decimal(10,2) NOT NULL,
  timeframe text NOT NULL,
  model text DEFAULT 'ensemble',
  factors jsonb DEFAULT '[]',
  accuracy decimal(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(symbol)
);

-- Portfolio tables
CREATE TABLE portfolio_holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  portfolio_id text NOT NULL DEFAULT 'default',
  symbol text NOT NULL,
  name text NOT NULL,
  shares decimal(10,4) NOT NULL,
  avg_price decimal(10,2) NOT NULL,
  current_price decimal(10,2) NOT NULL,
  value decimal(12,2) NOT NULL,
  gain_loss decimal(12,2) NOT NULL,
  gain_loss_percent decimal(5,2) NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Analytics tables
CREATE TABLE portfolio_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  portfolio_id text NOT NULL DEFAULT 'default',
  period text NOT NULL,
  total_return decimal(10,4) DEFAULT 0,
  annualized_return decimal(10,4) DEFAULT 0,
  volatility decimal(10,4) DEFAULT 0,
  sharpe_ratio decimal(10,4) DEFAULT 0,
  beta decimal(10,4) DEFAULT 0,
  alpha decimal(10,4) DEFAULT 0,
  max_drawdown decimal(10,4) DEFAULT 0,
  var_95 decimal(10,2) DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, portfolio_id, period)
);

-- Notifications table
CREATE TABLE user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```

## N8N Workflow Configurations

### 1. Dashboard Trigger Workflow
**Webhook URL**: `/webhook/dashboard-trigger`
**Purpose**: Main dashboard data updates

#### Workflow Structure:
```
Webhook Trigger → Stock API (Alpha Vantage/Yahoo) → AI Prediction Service → Format Data → Update Supabase
```

#### Expected Payload:
```json
{
  "trigger": "dashboardtrigger",
  "userId": "user-uuid",
  "symbols": ["AAPL", "GOOGL", "MSFT", "TSLA", "NVDA"],
  "timestamp": "2024-01-15T10:30:00Z",
  "triggerType": "dashboard",
  "requestId": "unique-request-id"
}
```

#### Expected Response:
```json
{
  "stocks": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "price": 189.95,
      "change": 5.24,
      "changePercent": 2.84,
      "volume": "45.2M",
      "marketCap": "2.98T",
      "sector": "Technology",
      "prediction": {
        "direction": "BUY",
        "confidence": 85,
        "targetPrice": 195.50,
        "timeframe": "1 week"
      }
    }
  ]
}
```

### 2. Portfolio Trigger Workflow
**Webhook URL**: `/webhook/portfolio-trigger`
**Purpose**: Portfolio data and analytics

#### Expected Payload:
```json
{
  "trigger": "portfolio-trigger",
  "userId": "user-uuid",
  "portfolioId": "default",
  "includeTransactions": true,
  "includeAnalytics": true,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Expected Response:
```json
{
  "portfolio": {
    "holdings": [
      {
        "symbol": "AAPL",
        "name": "Apple Inc.",
        "shares": 50,
        "avgPrice": 150.25,
        "currentPrice": 189.95,
        "value": 9497.50,
        "gainLoss": 1985.00,
        "gainLossPercent": 26.4
      }
    ],
    "summary": {
      "totalValue": 38467.70,
      "totalCost": 32825.00,
      "totalGainLoss": 5642.70,
      "totalGainLossPercent": 17.2,
      "dayChange": 1247.85,
      "dayChangePercent": 3.35
    }
  }
}
```

### 3. Predictions Trigger Workflow
**Webhook URL**: `/webhook/predictions-trigger`
**Purpose**: AI-powered stock predictions

#### Expected Payload:
```json
{
  "trigger": "prediction-trigger",
  "userId": "user-uuid",
  "symbols": ["AAPL", "GOOGL", "MSFT"],
  "models": ["neural_network", "random_forest", "lstm", "ensemble"],
  "timeframe": "1w",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Expected Response:
```json
{
  "predictions": [
    {
      "symbol": "AAPL",
      "direction": "BUY",
      "confidence": 85,
      "targetPrice": 195.50,
      "timeframe": "1 week",
      "model": "ensemble",
      "factors": ["earnings_growth", "technical_indicators", "market_sentiment"],
      "accuracy": 78.5
    }
  ],
  "modelPerformance": [
    {
      "model": "ensemble",
      "accuracy": 84.3,
      "predictions": 2100
    }
  ]
}
```

### 4. Analytics Trigger Workflow
**Webhook URL**: `/webhook/analytics-trigger`
**Purpose**: Portfolio analytics and risk metrics

#### Expected Payload:
```json
{
  "trigger": "analytics-trigger",
  "userId": "user-uuid",
  "portfolioId": "default",
  "period": "6m",
  "includeRisk": true,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Expected Response:
```json
{
  "analytics": {
    "performance": {
      "totalReturn": 31.8,
      "annualizedReturn": 18.7,
      "volatility": 22.5,
      "sharpeRatio": 1.42,
      "beta": 1.15,
      "alpha": 4.2,
      "maxDrawdown": -8.3,
      "var95": 3250
    },
    "allocation": [
      {
        "sector": "Technology",
        "percentage": 65,
        "performance": 15.2,
        "risk": 0.25
      }
    ],
    "correlation": [
      {
        "asset1": "AAPL",
        "asset2": "MSFT",
        "correlation": 0.72
      }
    ]
  }
}
```

### 5. Alerts Trigger Workflow
**Webhook URL**: `/webhook/alerts-trigger`
**Purpose**: Price alerts and notifications

#### Expected Payload:
```json
{
  "trigger": "alerts-trigger",
  "userId": "user-uuid",
  "checkTriggers": true,
  "updatePrices": true,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 6. Search Trigger Workflow
**Webhook URL**: `/webhook/search-trigger`
**Purpose**: Stock search and discovery

#### Expected Payload:
```json
{
  "trigger": "search-trigger",
  "userId": "user-uuid",
  "query": "apple",
  "limit": 20,
  "includePopular": true,
  "includeTrending": true,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 7. Watchlist Trigger Workflow
**Webhook URL**: `/webhook/watchlist-trigger`
**Purpose**: Watchlist management and updates

#### Expected Payload:
```json
{
  "trigger": "watchlist-trigger",
  "userId": "user-uuid",
  "updatePrices": true,
  "includeMetrics": true,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 8. Settings Trigger Workflow
**Webhook URL**: `/webhook/settings-trigger`
**Purpose**: User settings and preferences

#### Expected Payload:
```json
{
  "trigger": "settings-trigger",
  "userId": "user-uuid",
  "settings": {
    "notifications": {
      "emailAlerts": true,
      "pushNotifications": true
    }
  },
  "action": "update",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 9. Notification Trigger Workflow
**Webhook URL**: `/webhook/notification-trigger`
**Purpose**: Real-time notifications

#### Expected Payload:
```json
{
  "trigger": "notification-trigger",
  "userId": "user-uuid",
  "notification": {
    "title": "Price Alert",
    "message": "AAPL has reached your target price",
    "type": "success",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "requestId": "unique-request-id"
}
```

## API Integration Examples

### Stock Data APIs
1. **Alpha Vantage**: Real-time and historical stock data
2. **Yahoo Finance**: Market data and news
3. **IEX Cloud**: Financial data API
4. **Polygon.io**: Real-time market data

### AI/ML Services
1. **OpenAI GPT**: Market sentiment analysis
2. **Google Cloud AI**: Prediction models
3. **AWS SageMaker**: Custom ML models
4. **TensorFlow Serving**: Model inference

## Error Handling
All workflows should include proper error handling:

```json
{
  "success": false,
  "error": "API rate limit exceeded",
  "timestamp": "2024-01-15T10:30:00Z",
  "retryAfter": 60
}
```

## Rate Limiting
- Implement rate limiting in N8N workflows
- Use caching for frequently requested data
- Batch API calls when possible

## Security
- Use environment variables for API keys
- Implement proper authentication
- Validate all incoming webhook data
- Use HTTPS for all communications

## Monitoring
- Log all webhook calls
- Monitor API response times
- Set up alerts for failed workflows
- Track data freshness and accuracy

## Testing
1. Test each webhook endpoint individually
2. Verify database updates
3. Check real-time UI updates
4. Test error scenarios
5. Validate data accuracy

This comprehensive setup enables a fully automated, real-time stock trading dashboard with AI predictions, portfolio management, and intelligent notifications.
