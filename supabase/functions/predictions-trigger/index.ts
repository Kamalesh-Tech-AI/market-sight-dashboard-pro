import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PredictionData {
  symbol: string
  direction: 'BUY' | 'SELL' | 'HOLD'
  confidence: number
  targetPrice: number
  timeframe: string
  model: string
  factors: string[]
  accuracy?: number
}

interface ModelPerformance {
  model: string
  accuracy: number
  predictions: number
  lastUpdated: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the n8n predictions webhook URL from Supabase secrets
    const n8nWebhookUrl = Deno.env.get('N8N_PREDICTIONS_WEBHOOK_URL')
    
    if (!n8nWebhookUrl) {
      throw new Error('N8N_PREDICTIONS_WEBHOOK_URL not configured in Supabase secrets')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get request data
    const { userId, symbols, models, timeframe = '1w' } = await req.json()

    // Default symbols if none provided
    const defaultSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN']
    const stockSymbols = symbols || defaultSymbols

    // Prepare payload for n8n webhook
    const n8nPayload = {
      trigger: 'prediction-trigger',
      userId: userId,
      symbols: stockSymbols,
      models: models || ['neural_network', 'random_forest', 'lstm', 'ensemble'],
      timeframe: timeframe,
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID()
    }

    // Call n8n predictions webhook
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload)
    })

    if (!n8nResponse.ok) {
      throw new Error(`N8N predictions webhook failed: ${n8nResponse.statusText}`)
    }

    const n8nData = await n8nResponse.json()

    // Process the predictions data returned from n8n
    const predictionsData: PredictionData[] = n8nData.predictions || []
    const modelPerformance: ModelPerformance[] = n8nData.modelPerformance || []

    // Store the updated predictions data in Supabase
    if (predictionsData.length > 0) {
      // Update predictions table
      for (const prediction of predictionsData) {
        const { error: predictionError } = await supabase
          .from('predictions')
          .upsert({
            symbol: prediction.symbol,
            direction: prediction.direction,
            confidence: prediction.confidence,
            target_price: prediction.targetPrice,
            timeframe: prediction.timeframe,
            model: prediction.model,
            factors: prediction.factors,
            accuracy: prediction.accuracy,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'symbol'
          })

        if (predictionError) {
          console.error(`Error updating prediction for ${prediction.symbol}:`, predictionError)
        }
      }

      // Store model performance data
      if (modelPerformance.length > 0) {
        for (const model of modelPerformance) {
          const { error: modelError } = await supabase
            .from('model_performance')
            .upsert({
              model_name: model.model,
              accuracy: model.accuracy,
              total_predictions: model.predictions,
              last_updated: new Date().toISOString()
            }, {
              onConflict: 'model_name'
            })

          if (modelError) {
            console.error(`Error updating model performance for ${model.model}:`, modelError)
          }
        }
      }

      // Log the trigger event
      const { error: logError } = await supabase
        .from('trigger_logs')
        .insert({
          user_id: userId,
          trigger_type: 'predictions',
          symbols: stockSymbols,
          status: 'success',
          response_data: n8nData,
          created_at: new Date().toISOString()
        })

      if (logError) {
        console.error('Error logging predictions trigger event:', logError)
      }
    }

    // Return the processed data
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Predictions trigger executed successfully',
        data: {
          predictions: predictionsData,
          modelPerformance: modelPerformance,
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
    console.error('Predictions trigger error:', error)
    
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
