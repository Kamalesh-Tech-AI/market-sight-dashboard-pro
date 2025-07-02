import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: string
  marketCap: string
  sector: string
  prediction?: {
    direction: 'BUY' | 'SELL' | 'HOLD'
    confidence: number
    targetPrice: number
    timeframe: string
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the n8n webhook URL from Supabase secrets
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL')
    
    if (!n8nWebhookUrl) {
      throw new Error('N8N_WEBHOOK_URL not configured in Supabase secrets')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get request data
    const { userId, symbols, triggerType = 'dashboard' } = await req.json()

    // Default symbols if none provided
    const defaultSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN', 'META', 'NFLX']
    const stockSymbols = symbols || defaultSymbols

    // Prepare payload for n8n webhook
    const n8nPayload = {
      trigger: 'dashboardtrigger',
      userId: userId,
      symbols: stockSymbols,
      timestamp: new Date().toISOString(),
      triggerType: triggerType,
      requestId: crypto.randomUUID()
    }

    // Call n8n webhook
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload)
    })

    if (!n8nResponse.ok) {
      throw new Error(`N8N webhook failed: ${n8nResponse.statusText}`)
    }

    const n8nData = await n8nResponse.json()

    // Process the stock data returned from n8n
    const stockData: StockData[] = n8nData.stocks || []

    // Store the updated stock data in Supabase
    if (stockData.length > 0) {
      // Update stocks table
      for (const stock of stockData) {
        const { error: stockError } = await supabase
          .from('stocks')
          .upsert({
            symbol: stock.symbol,
            name: stock.name,
            price: stock.price,
            change: stock.change,
            change_percent: stock.changePercent,
            volume: stock.volume,
            market_cap: stock.marketCap,
            sector: stock.sector,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'symbol'
          })

        if (stockError) {
          console.error(`Error updating stock ${stock.symbol}:`, stockError)
        }

        // Store predictions if available
        if (stock.prediction) {
          const { error: predictionError } = await supabase
            .from('predictions')
            .upsert({
              symbol: stock.symbol,
              direction: stock.prediction.direction,
              confidence: stock.prediction.confidence,
              target_price: stock.prediction.targetPrice,
              timeframe: stock.prediction.timeframe,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'symbol'
            })

          if (predictionError) {
            console.error(`Error updating prediction for ${stock.symbol}:`, predictionError)
          }
        }
      }

      // Log the trigger event
      const { error: logError } = await supabase
        .from('trigger_logs')
        .insert({
          user_id: userId,
          trigger_type: triggerType,
          symbols: stockSymbols,
          status: 'success',
          response_data: n8nData,
          created_at: new Date().toISOString()
        })

      if (logError) {
        console.error('Error logging trigger event:', logError)
      }
    }

    // Return the processed data
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Dashboard trigger executed successfully',
        data: {
          stocks: stockData,
          triggeredAt: new Date().toISOString(),
          requestId: n8nPayload.requestId
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Dashboard trigger error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
