# N8N Webhook Triggers Configuration

This file contains all the webhook trigger names that need to be configured in your Supabase secrets for the StockIQ dashboard.

## Required Supabase Secrets

Please add the following secrets in your Supabase project (Settings → Edge Functions → Secrets):

### 1. Dashboard Trigger
```
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/dashboardtrigger
```

### 2. Predictions Trigger
```
N8N_PREDICTIONS_WEBHOOK_URL=https://your-n8n-instance.com/webhook/prediction-trigger
```

### 3. Analytics Trigger
```
N8N_ANALYTICS_WEBHOOK_URL=https://your-n8n-instance.com/webhook/analytics-trigger
```

## Trigger Names Summary

| Page | Trigger Name | Secret Variable | Purpose |
|------|-------------|----------------|---------|
| Dashboard | `dashboardtrigger` | `N8N_WEBHOOK_URL` | Real-time stock data and predictions |
| Predictions | `prediction-trigger` | `N8N_PREDICTIONS_WEBHOOK_URL` | AI model predictions and analysis |
| Analytics | `analytics-trigger` | `N8N_ANALYTICS_WEBHOOK_URL` | Portfolio analytics and risk metrics |

## N8N Workflow Setup

### Dashboard Workflow (dashboardtrigger)
- **Trigger**: Webhook listening for `dashboardtrigger`
- **Data Sources**: Stock APIs (Alpha Vantage, Yahoo Finance, etc.)
- **Output**: Real-time stock prices, volumes, and basic predictions

### Predictions Workflow (prediction-trigger)
- **Trigger**: Webhook listening for `prediction-trigger`
- **Data Sources**: AI/ML prediction services, technical analysis APIs
- **Output**: Detailed predictions with confidence scores and timeframes

### Analytics Workflow (analytics-trigger)
- **Trigger**: Webhook listening for `analytics-trigger`
- **Data Sources**: Portfolio data, risk calculation services
- **Output**: Performance metrics, risk analysis, sector allocations

## Expected Response Formats

### Dashboard Response
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
      "sector": "Technology"
    }
  ]
}
```

### Predictions Response
```json
{
  "predictions": [
    {
      "symbol": "AAPL",
      "direction": "BUY",
      "confidence": 85,
      "targetPrice": 195.50,
      "timeframe": "1 week",
      "model": "Neural Network",
      "factors": ["earnings", "technical", "sentiment"]
    }
  ]
}
```

### Analytics Response
```json
{
  "analytics": {
    "performance": {
      "totalReturn": 31.8,
      "annualizedReturn": 18.7,
      "volatility": 22.5,
      "sharpeRatio": 1.42
    },
    "risk": {
      "beta": 1.15,
      "maxDrawdown": -8.3,
      "var95": -3250
    },
    "allocation": [
      {
        "sector": "Technology",
        "percentage": 65,
        "performance": 15.2
      }
    ]
  }
}
```

## Deployment Instructions

1. **Create N8N Workflows** for each trigger name
2. **Add Webhook URLs** to Supabase secrets using the variable names above
3. **Deploy Edge Functions** using: `supabase functions deploy function-name`
4. **Test Integration** by accessing each page in the dashboard

## Security Notes

- All webhook URLs should use HTTPS
- Consider adding authentication tokens to webhook URLs
- Monitor webhook call frequency to avoid rate limits
- Set up error handling and fallback mechanisms
