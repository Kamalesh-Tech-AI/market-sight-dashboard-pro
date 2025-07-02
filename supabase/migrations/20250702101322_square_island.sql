/*
  # Create stocks and predictions tables for n8n integration

  1. New Tables
    - `stocks`
      - `symbol` (text, primary key)
      - `name` (text)
      - `price` (decimal)
      - `change` (decimal)
      - `change_percent` (decimal)
      - `volume` (text)
      - `market_cap` (text)
      - `sector` (text)
      - `updated_at` (timestamp)
    
    - `predictions`
      - `id` (uuid, primary key)
      - `symbol` (text, foreign key)
      - `direction` (text)
      - `confidence` (integer)
      - `target_price` (decimal)
      - `timeframe` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `trigger_logs`
      - `id` (uuid, primary key)
      - `user_id` (text)
      - `trigger_type` (text)
      - `symbols` (jsonb)
      - `status` (text)
      - `response_data` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create stocks table
CREATE TABLE IF NOT EXISTS stocks (
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

-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL REFERENCES stocks(symbol) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction IN ('BUY', 'SELL', 'HOLD')),
  confidence integer NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  target_price decimal(10,2) NOT NULL,
  timeframe text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(symbol)
);

-- Create trigger logs table
CREATE TABLE IF NOT EXISTS trigger_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  trigger_type text NOT NULL,
  symbols jsonb,
  status text NOT NULL,
  response_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trigger_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for stocks table
CREATE POLICY "Anyone can read stocks"
  ON stocks
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can manage stocks"
  ON stocks
  FOR ALL
  TO service_role
  USING (true);

-- Create policies for predictions table
CREATE POLICY "Anyone can read predictions"
  ON predictions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can manage predictions"
  ON predictions
  FOR ALL
  TO service_role
  USING (true);

-- Create policies for trigger_logs table
CREATE POLICY "Users can read their own trigger logs"
  ON trigger_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Service role can manage trigger logs"
  ON trigger_logs
  FOR ALL
  TO service_role
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stocks_symbol ON stocks(symbol);
CREATE INDEX IF NOT EXISTS idx_stocks_updated_at ON stocks(updated_at);
CREATE INDEX IF NOT EXISTS idx_predictions_symbol ON predictions(symbol);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at);
CREATE INDEX IF NOT EXISTS idx_trigger_logs_user_id ON trigger_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_trigger_logs_created_at ON trigger_logs(created_at);
