/*
  # Portfolio and Notifications Tables

  1. New Tables
    - `portfolio_holdings` - User portfolio holdings
    - `portfolio_transactions` - Transaction history
    - `portfolio_summary` - Portfolio summary metrics
    - `user_notifications` - User notifications
    - `user_watchlist` - User watchlist
    - `user_alerts` - User price alerts
    - `alert_settings` - Alert notification settings

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users and service role

  3. Indexes
    - Add performance indexes for common queries
*/

-- Create portfolio holdings table
CREATE TABLE IF NOT EXISTS portfolio_holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  portfolio_id text NOT NULL DEFAULT 'default',
  symbol text NOT NULL,
  name text NOT NULL,
  shares decimal(10,4) NOT NULL DEFAULT 0,
  avg_price decimal(10,2) NOT NULL DEFAULT 0,
  current_price decimal(10,2) NOT NULL DEFAULT 0,
  value decimal(12,2) NOT NULL DEFAULT 0,
  gain_loss decimal(12,2) NOT NULL DEFAULT 0,
  gain_loss_percent decimal(5,2) NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create portfolio transactions table
CREATE TABLE IF NOT EXISTS portfolio_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  portfolio_id text NOT NULL DEFAULT 'default',
  type text NOT NULL CHECK (type IN ('BUY', 'SELL')),
  symbol text NOT NULL,
  shares decimal(10,4) NOT NULL,
  price decimal(10,2) NOT NULL,
  date timestamptz NOT NULL,
  total decimal(12,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create portfolio summary table
CREATE TABLE IF NOT EXISTS portfolio_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  portfolio_id text NOT NULL DEFAULT 'default',
  total_value decimal(12,2) NOT NULL DEFAULT 0,
  total_cost decimal(12,2) NOT NULL DEFAULT 0,
  total_gain_loss decimal(12,2) NOT NULL DEFAULT 0,
  total_gain_loss_percent decimal(5,2) NOT NULL DEFAULT 0,
  day_change decimal(12,2) NOT NULL DEFAULT 0,
  day_change_percent decimal(5,2) NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, portfolio_id)
);

-- Create user notifications table
CREATE TABLE IF NOT EXISTS user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create user watchlist table
CREATE TABLE IF NOT EXISTS user_watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  symbol text NOT NULL,
  added_at timestamptz DEFAULT now(),
  UNIQUE(user_id, symbol)
);

-- Create user alerts table
CREATE TABLE IF NOT EXISTS user_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  symbol text NOT NULL,
  type text NOT NULL CHECK (type IN ('price', 'change', 'volume')),
  condition text NOT NULL CHECK (condition IN ('above', 'below')),
  value decimal(10,2) NOT NULL,
  current_value decimal(10,2) DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'triggered', 'paused')),
  triggered boolean DEFAULT false,
  triggered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create alert settings table
CREATE TABLE IF NOT EXISTS alert_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT false,
  sound_enabled boolean DEFAULT true,
  quiet_hours_enabled boolean DEFAULT false,
  quiet_hours_start time DEFAULT '22:00',
  quiet_hours_end time DEFAULT '08:00',
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create popular stocks table
CREATE TABLE IF NOT EXISTS popular_stocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  name text NOT NULL,
  price decimal(10,2) NOT NULL DEFAULT 0,
  change decimal(10,2) NOT NULL DEFAULT 0,
  change_percent decimal(5,2) NOT NULL DEFAULT 0,
  sector text,
  market_cap text,
  popularity_score integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(symbol)
);

-- Create trending stocks table
CREATE TABLE IF NOT EXISTS trending_stocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  name text NOT NULL,
  price decimal(10,2) NOT NULL DEFAULT 0,
  change decimal(10,2) NOT NULL DEFAULT 0,
  change_percent decimal(5,2) NOT NULL DEFAULT 0,
  volume text,
  reason text,
  trend_score integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(symbol)
);

-- Enable Row Level Security
ALTER TABLE portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE popular_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_stocks ENABLE ROW LEVEL SECURITY;

-- Create policies for portfolio_holdings table
CREATE POLICY "Users can read their own portfolio holdings"
  ON portfolio_holdings
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Service role can manage portfolio holdings"
  ON portfolio_holdings
  FOR ALL
  TO service_role
  USING (true);

-- Create policies for portfolio_transactions table
CREATE POLICY "Users can read their own portfolio transactions"
  ON portfolio_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Service role can manage portfolio transactions"
  ON portfolio_transactions
  FOR ALL
  TO service_role
  USING (true);

-- Create policies for portfolio_summary table
CREATE POLICY "Users can read their own portfolio summary"
  ON portfolio_summary
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Service role can manage portfolio summary"
  ON portfolio_summary
  FOR ALL
  TO service_role
  USING (true);

-- Create policies for user_notifications table
CREATE POLICY "Users can read their own notifications"
  ON user_notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Service role can manage notifications"
  ON user_notifications
  FOR ALL
  TO service_role
  USING (true);

-- Create policies for user_watchlist table
CREATE POLICY "Users can manage their own watchlist"
  ON user_watchlist
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Service role can manage watchlist"
  ON user_watchlist
  FOR ALL
  TO service_role
  USING (true);

-- Create policies for user_alerts table
CREATE POLICY "Users can manage their own alerts"
  ON user_alerts
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Service role can manage alerts"
  ON user_alerts
  FOR ALL
  TO service_role
  USING (true);

-- Create policies for alert_settings table
CREATE POLICY "Users can manage their own alert settings"
  ON alert_settings
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Service role can manage alert settings"
  ON alert_settings
  FOR ALL
  TO service_role
  USING (true);

-- Create policies for popular_stocks table
CREATE POLICY "Anyone can read popular stocks"
  ON popular_stocks
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can manage popular stocks"
  ON popular_stocks
  FOR ALL
  TO service_role
  USING (true);

-- Create policies for trending_stocks table
CREATE POLICY "Anyone can read trending stocks"
  ON trending_stocks
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can manage trending stocks"
  ON trending_stocks
  FOR ALL
  TO service_role
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_user ON portfolio_holdings(user_id, portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_transactions_user ON portfolio_transactions(user_id, portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_summary_user ON portfolio_summary(user_id, portfolio_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON user_notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_watchlist_user ON user_watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_user_alerts_user ON user_alerts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_popular_stocks_score ON popular_stocks(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_trending_stocks_score ON trending_stocks(trend_score DESC);
