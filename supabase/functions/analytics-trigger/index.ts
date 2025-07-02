import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalyticsData {
  performance: {
    totalReturn: number
    annualizedReturn: number
    volatility: number
    sharpeRatio: number
    beta: number
    alpha: number
    maxDrawdown: number
    var95: number
  }
  allocation: {
    sector: string
    percentage: number
    performance: number
    risk: number
  }[]
  correlation: {
    asset1: string
    asset2: string
    correlation: number
  }[]
  riskMetrics: {
    metric: string
    value: string
    description: string
  }[]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the n8n analytics webhook URL from Supabase secrets
    const n8nWebhookUrl = Deno.env.get('N8N_ANALYTICS_WEBHOOK_URL')
    
    if (!n8nWebhookUrl) {
      throw new Error('N8N_ANALYTICS_WEBHOOK_URL not configured in Supabase secrets')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get request data
    const { userId, portfolioId, period = '6m', includeRisk = true } = await req.json()

    // Prepare payload for n8n webhook
    const n8nPayload = {
      trigger: 'analytics-trigger',
      userId: userId,
      portfolioId: portfolioId,
      period: period,
      includeRisk: includeRisk,
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID()
    }

    // Call n8n analytics webhook
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload)
    })

    if (!n8nResponse.ok) {
      throw new Error(`N8N analytics webhook failed: ${n8nResponse.statusText}`)
    }

    const n8nData = await n8nResponse.json()

    // Process the analytics data returned from n8n
    const analyticsData: AnalyticsData = n8nData.analytics || {}

    // Store the analytics data in Supabase
    if (analyticsData.performance) {
      // Update portfolio performance table
      const { error: performanceError } = await supabase
        .from('portfolio_performance')
        .upsert({
          user_id: userId,
          portfolio_id: portfolioId,
          period: period,
          total_return: analyticsData.performance.totalReturn,
          annualized_return: analyticsData.performance.annualizedReturn,
          volatility: analyticsData.performance.volatility,
          sharpe_ratio: analyticsData.performance.sharpeRatio,
          beta: analyticsData.performance.beta,
          alpha: analyticsData.performance.alpha,
          max_drawdown: analyticsData.performance.maxDrawdown,
          var_95: analyticsData.performance.var95,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,portfolio_id,period'
        })

      if (performanceError) {
        console.error('Error updating portfolio performance:', performanceError)
      }
    }

    // Store sector allocation data
    if (analyticsData.allocation && analyticsData.allocation.length > 0) {
      // Clear existing allocation data for this portfolio
      await supabase
        .from('sector_allocation')
        .delete()
        .eq('user_id', userId)
        .eq('portfolio_id', portfolioId)

      // Insert new allocation data
      for (const allocation of analyticsData.allocation) {
        const { error: allocationError } = await supabase
          .from('sector_allocation')
          .insert({
            user_id: userId,
            portfolio_id: portfolioId,
            sector: allocation.sector,
            percentage: allocation.percentage,
            performance: allocation.performance,
            risk: allocation.risk,
            created_at: new Date().toISOString()
          })

        if (allocationError) {
          console.error(`Error inserting sector allocation for ${allocation.sector}:`, allocationError)
        }
      }
    }

    // Store correlation data
    if (analyticsData.correlation && analyticsData.correlation.length > 0) {
      // Clear existing correlation data for this portfolio
      await supabase
        .from('asset_correlations')
        .delete()
        .eq('user_id', userId)
        .eq('portfolio_id', portfolioId)

      // Insert new correlation data
      for (const correlation of analyticsData.correlation) {
        const { error: correlationError } = await supabase
          .from('asset_correlations')
          .insert({
            user_id: userId,
            portfolio_id: portfolioId,
            asset1: correlation.asset1,
            asset2: correlation.asset2,
            correlation: correlation.correlation,
            created_at: new Date().toISOString()
          })

        if (correlationError) {
          console.error(`Error inserting correlation for ${correlation.asset1}-${correlation.asset2}:`, correlationError)
        }
      }
    }

    // Log the trigger event
    const { error: logError } = await supabase
      .from('trigger_logs')
      .insert({
        user_id: userId,
        trigger_type: 'analytics',
        symbols: null,
        status: 'success',
        response_data: n8nData,
        created_at: new Date().toISOString()
      })

    if (logError) {
      console.error('Error logging analytics trigger event:', logError)
    }

    // Return the processed data
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Analytics trigger executed successfully',
        data: {
          analytics: analyticsData,
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
    console.error('Analytics trigger error:', error)
    
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
