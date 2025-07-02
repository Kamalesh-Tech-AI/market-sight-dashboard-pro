# StockIQ Dashboard - N8N Integration

A professional stock trading dashboard with real-time data integration using N8N automation and Supabase.

## Features

- **Real-time Stock Data**: Live stock prices and market data via N8N webhooks
- **AI Predictions**: Machine learning-powered stock predictions
- **Portfolio Management**: Track and manage your investment portfolio
- **Advanced Analytics**: Comprehensive portfolio analytics and risk assessment
- **Smart Alerts**: Customizable price and volume alerts
- **Watchlists**: Organize and monitor your favorite stocks

## N8N Integration Setup

### 1. Supabase Configuration

The project includes a Supabase edge function that handles N8N webhook triggers:

- **Function**: `dashboard-trigger`
- **Trigger**: `dashboardtrigger`
- **Database Tables**: `stocks`, `predictions`, `trigger_logs`

### 2. Environment Variables

Set the following secret in your Supabase project:

```bash
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/dashboardtrigger
```

### 3. N8N Workflow Setup

Create an N8N workflow with:

1. **Webhook Trigger**: Listen for `dashboardtrigger` events
2. **Stock Data API**: Fetch real-time stock data (Alpha Vantage, Yahoo Finance, etc.)
3. **AI Prediction Service**: Generate stock predictions
4. **Response**: Return formatted data to Supabase

#### Sample N8N Workflow Structure:

```
Webhook Trigger → Stock API → AI Predictions → Format Response
```

#### Expected Response Format:

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

### 4. Dashboard Integration

The dashboard automatically triggers the N8N workflow when:

- User loads the dashboard page
- Manual refresh is clicked
- Real-time updates are requested

### 5. Database Schema

```sql
-- Stocks table
CREATE TABLE stocks (
  symbol text PRIMARY KEY,
  name text NOT NULL,
  price decimal(10,2),
  change decimal(10,2),
  change_percent decimal(5,2),
  volume text,
  market_cap text,
  sector text,
  updated_at timestamptz DEFAULT now()
);

-- Predictions table
CREATE TABLE predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text REFERENCES stocks(symbol),
  direction text CHECK (direction IN ('BUY', 'SELL', 'HOLD')),
  confidence integer CHECK (confidence >= 0 AND confidence <= 100),
  target_price decimal(10,2),
  timeframe text,
  created_at timestamptz DEFAULT now()
);
```

## Usage

1. **Automatic Triggers**: The dashboard automatically fetches live data when loaded
2. **Manual Refresh**: Click the refresh button to trigger immediate updates
3. **Real-time Updates**: Data updates automatically via Supabase real-time subscriptions
4. **Error Handling**: Graceful fallback to mock data if N8N is unavailable

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Deploy Supabase functions
supabase functions deploy dashboard-trigger
```

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Database, Edge Functions, Real-time)
- **Automation**: N8N (Webhooks, Data Processing)
- **Charts**: Recharts
- **State Management**: React Hooks, TanStack Query

## Security

- Row Level Security (RLS) enabled on all tables
- Service role authentication for N8N integration
- CORS headers configured for secure API access
- Environment variables for sensitive configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the N8N integration
5. Submit a pull request

## License

MIT License - see LICENSE file for details
