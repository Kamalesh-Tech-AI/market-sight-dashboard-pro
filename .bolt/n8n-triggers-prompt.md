# N8N Webhook Triggers for StockIQ Dashboard

This document outlines all the N8N webhook triggers required for the StockIQ dashboard application.

## Overview

The StockIQ dashboard integrates with N8N automation workflows through webhook triggers. Each trigger handles specific functionality and data processing requirements.

## Required Supabase Secrets

Add these secrets to your Supabase project settings:

```bash
# Main triggers
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/dashboardtrigger
N8N_PREDICTIONS_WEBHOOK_URL=https://your-n8n-instance.com/webhook/predictionstrigger
N8N_ANALYTICS_WEBHOOK_URL=https://your-n8n-instance.com/webhook/analyticstrigger

# New page triggers
N8N_PORTFOLIO_WEBHOOK_URL=https://your-n8n-instance.com/webhook/portfoliotrigger
N8N_ALERTS_WEBHOOK_URL=https://your-n8n-instance.com/webhook/alertstrigger
N8N_SEARCH_WEBHOOK_URL=https://your-n8n-instance.com/webhook/searchtrigger
N8N_WATCHLIST_WEBHOOK_URL=https://your-n8n-instance.com/webhook/watchlisttrigger
N8N_SETTINGS_WEBHOOK_URL=https://your-n8n-instance.com/webhook/settingstrigger
```

## Webhook Triggers

### 1. Dashboard Trigger
**Endpoint:** `/webhook/dashboardtrigger`
**Purpose:** Main dashboard data updates including stocks and predictions

**Payload:**
```json
{
  "trigger": "dashboardtrigger",
  "userId": "string",
  "symbols": ["AAPL", "GOOGL", "MSFT"],
  "timestamp": "2024-01-15T10:30:00Z",
  "triggerType": "dashboard",
  "requestId": "uuid"
}
```

**Expected Response:**
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

### 2. Predictions Trigger
**Endpoint:** `/webhook/predictionstrigger`
**Purpose:** AI predictions and model performance data

**Payload:**
```json
{
  "trigger": "prediction-trigger",
  "userId": "string",
  "symbols": ["AAPL", "GOOGL"],
  "models": ["neural_network", "random_forest", "lstm", "ensemble"],
  "timeframe": "1w",
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "uuid"
}
```

**Expected Response:**
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
      "factors": ["earnings", "technical", "sentiment"],
      "accuracy": 78
    }
  ],
  "modelPerformance": [
    {
      "model": "Neural Network",
      "accuracy": 78.5,
      "predictions": 1250
    }
  ]
}
```

### 3. Analytics Trigger
**Endpoint:** `/webhook/analyticstrigger`
**Purpose:** Portfolio analytics and performance metrics

**Payload:**
```json
{
  "trigger": "analytics-trigger",
  "userId": "string",
  "portfolioId": "default",
  "period": "6m",
  "includeRisk": true,
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "uuid"
}
```

**Expected Response:**
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

### 4. Portfolio Trigger
**Endpoint:** `/webhook/portfoliotrigger`
**Purpose:** Portfolio holdings, transactions, and summary data

**Payload:**
```json
{
  "trigger": "portfolio-trigger",
  "userId": "string",
  "portfolioId": "default",
  "includeTransactions": true,
  "includeAnalytics": true,
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "uuid"
}
```

**Expected Response:**
```json
{
  "portfolio": {
    "holdings": [
      {
        "symbol": "AAPL",
        "name": "Apple Inc.",
        "shares": 50,
        "avgPrice": 180.25,
        "currentPrice": 189.95,
        "value": 9497.50,
        "gainLoss": 485.00,
        "gainLossPercent": 5.38
      }
    ],
    "transactions": [
      {
        "id": 1,
        "type": "BUY",
        "symbol": "AAPL",
        "shares": 10,
        "price": 189.95,
        "date": "2024-01-15",
        "total": 1899.50
      }
    ],
    "summary": {
      "totalValue": 38467.70,
      "totalCost": 37315.20,
      "totalGainLoss": 1152.50,
      "totalGainLossPercent": 3.09,
      "dayChange": 485.30,
      "dayChangePercent": 1.28
    }
  }
}
```

### 5. Alerts Trigger
**Endpoint:** `/webhook/alertstrigger`
**Purpose:** Price alerts, notifications, and alert management

**Payload:**
```json
{
  "trigger": "alerts-trigger",
  "userId": "string",
  "checkTriggers": true,
  "updatePrices": true,
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "uuid"
}
```

**Expected Response:**
```json
{
  "alerts": [
    {
      "id": 1,
      "symbol": "AAPL",
      "type": "price",
      "condition": "above",
      "value": 190,
      "currentValue": 189.95,
      "status": "active",
      "triggered": false
    }
  ],
  "settings": {
    "emailNotifications": true,
    "pushNotifications": true,
    "smsNotifications": false,
    "soundEnabled": true,
    "quietHours": {
      "enabled": true,
      "start": "22:00",
      "end": "08:00"
    }
  }
}
```

### 6. Search Trigger
**Endpoint:** `/webhook/searchtrigger`
**Purpose:** Stock search, popular stocks, and trending data

**Payload:**
```json
{
  "trigger": "search-trigger",
  "userId": "string",
  "query": "apple",
  "limit": 20,
  "includePopular": true,
  "includeTrending": true,
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "uuid"
}
```

**Expected Response:**
```json
{
  "results": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "price": 189.95,
      "change": 5.24,
      "changePercent": 2.84,
      "sector": "Technology",
      "marketCap": "2.98T"
    }
  ],
  "popular": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "price": 189.95,
      "change": 5.24,
      "changePercent": 2.84,
      "sector": "Technology",
      "marketCap": "2.98T"
    }
  ],
  "trending": [
    {
      "symbol": "TSLA",
      "name": "Tesla Inc",
      "price": 248.50,
      "change": 18.75,
      "changePercent": 8.16,
      "volume": "52.3M",
      "reason": "Strong Q4 earnings"
    }
  ]
}
```

### 7. Watchlist Trigger
**Endpoint:** `/webhook/watchlisttrigger`
**Purpose:** Watchlist management and stock monitoring

**Payload:**
```json
{
  "trigger": "watchlist-trigger",
  "userId": "string",
  "updatePrices": true,
  "includeMetrics": true,
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "uuid"
}
```

**Expected Response:**
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
      "addedDate": "2024-01-10"
    }
  ]
}
```

### 8. Settings Trigger
**Endpoint:** `/webhook/settingstrigger`
**Purpose:** User settings and preferences management

**Payload:**
```json
{
  "trigger": "settings-trigger",
  "userId": "string",
  "settings": {
    "user": {
      "name": "John Doe",
      "email": "john@example.com",
      "timezone": "America/New_York"
    }
  },
  "action": "update",
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "uuid"
}
```

**Expected Response:**
```json
{
  "user": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "timezone": "America/New_York",
    "currency": "USD",
    "language": "en"
  },
  "notifications": {
    "emailAlerts": true,
    "pushNotifications": true,
    "smsAlerts": false
  },
  "api": {
    "webhookUrl": "",
    "apiKey": "sk-1234567890abcdef",
    "rateLimitEnabled": true
  },
  "security": {
    "twoFactorEnabled": false,
    "sessionTimeout": 30,
    "loginNotifications": true
  }
}
```

## Database Tables

The following database tables are used to store the webhook response data:

### Core Tables (Already Created)
- `stocks` - Stock price and market data
- `predictions` - AI predictions and model data
- `model_performance` - Model accuracy tracking
- `portfolio_performance` - Portfolio analytics
- `sector_allocation` - Sector allocation data
- `asset_correlations` - Asset correlation data
- `trigger_logs` - Webhook trigger logging

### Additional Tables Needed
- `portfolio_holdings` - User portfolio holdings
- `portfolio_transactions` - Transaction history
- `portfolio_summary` - Portfolio summary metrics
- `user_alerts` - User price alerts
- `alert_settings` - Alert notification settings
- `user_watchlist` - User watchlist stocks
- `popular_stocks` - Popular stocks data
- `trending_stocks` - Trending stocks data
- `user_settings` - User profile settings
- `notification_settings` - Notification preferences
- `api_settings` - API configuration
- `security_settings` - Security preferences

## Implementation Notes

1. **Error Handling**: All triggers include comprehensive error handling and fallback to mock data
2. **Real-time Updates**: Supabase real-time subscriptions are set up for live data updates
3. **Authentication**: All triggers use Supabase authentication for user identification
4. **Rate Limiting**: Consider implementing rate limiting for webhook calls
5. **Logging**: All trigger events are logged in the `trigger_logs` table
6. **Security**: Use Supabase service role key for database operations

## Testing

Each trigger can be tested independently by calling the respective Supabase edge function. Mock data is provided as fallback when N8N webhooks are not available.
