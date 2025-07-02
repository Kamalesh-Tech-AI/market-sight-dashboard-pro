/*
  # Analytics and Model Performance Tables

  1. New Tables
    - `model_performance` - Track AI model accuracy and performance
    - `portfolio_performance` - Store portfolio analytics and metrics
    - `sector_allocation` - Track sector allocation and performance
    - `asset_correlations` - Store asset correlation data

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users and service role

  3. Indexes
    - Add performance indexes for common queries
*/

-- Create model performance table
CREATE TABLE IF NOT EXISTS model_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name text UNIQUE NOT NULL,
  accuracy decimal(5,2) NOT NULL DEFAULT 0,
  total_predictions integer NOT NULL DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create portfolio performance table
CREATE TABLE IF NOT EXISTS portfolio_performance (
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
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, portfolio_id, period)
);

-- Create sector allocation table
CREATE TABLE IF NOT EXISTS sector_allocation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  portfolio_id text NOT NULL DEFAULT 'default',
  sector text NOT NULL,
  percentage decimal(5,2) NOT NULL DEFAULT 0,
  performance decimal(10,4) DEFAULT 0,
  risk decimal(10,4) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create asset correlations table
CREATE TABLE IF NOT EXISTS asset_correlations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  portfolio_id text NOT NULL DEFAULT 'default',
  asset1 text NOT NULL,
  asset2 text NOT NULL,
  correlation decimal(5,4) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Add new columns to predictions table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'predictions' AND column_name = 'model'
  ) THEN
    ALTER TABLE predictions ADD COLUMN model text DEFAULT 'ensemble';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'predictions' AND column_name = 'factors'
  ) THEN
    ALTER TABLE predictions ADD COLUMN factors jsonb DEFAULT '[]';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'predictions' AND column_name = 'accuracy'
  ) THEN
    ALTER TABLE predictions ADD COLUMN accuracy decimal(5,2) DEFAULT 0;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE model_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE sector_allocation ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_correlations ENABLE ROW LEVEL SECURITY;

-- Create policies for model_performance table
CREATE POLICY "Anyone can read model performance"
  ON model_performance
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can manage model performance"
  ON model_performance
  FOR ALL
  TO service_role
  USING (true);

-- Create policies for portfolio_performance table
CREATE POLICY "Users can read their own portfolio performance"
  ON portfolio_performance
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Service role can manage portfolio performance"
  ON portfolio_performance
  FOR ALL
  TO service_role
  USING (true);

-- Create policies for sector_allocation table
CREATE POLICY "Users can read their own sector allocation"
  ON sector_allocation
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Service role can manage sector allocation"
  ON sector_allocation
  FOR ALL
  TO service_role
  USING (true);

-- Create policies for asset_correlations table
CREATE POLICY "Users can read their own asset correlations"
  ON asset_correlations
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Service role can manage asset correlations"
  ON asset_correlations
  FOR ALL
  TO service_role
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_model_performance_name ON model_performance(model_name);
CREATE INDEX IF NOT EXISTS idx_portfolio_performance_user ON portfolio_performance(user_id, portfolio_id);
CREATE INDEX IF NOT EXISTS idx_sector_allocation_user ON sector_allocation(user_id, portfolio_id);
CREATE INDEX IF NOT EXISTS idx_asset_correlations_user ON asset_correlations(user_id, portfolio_id);
CREATE INDEX IF NOT EXISTS idx_predictions_model ON predictions(model);
