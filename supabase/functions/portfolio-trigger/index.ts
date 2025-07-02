import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PortfolioData {
  holdings: {
    symbol: string
    name: string
    shares: number
    avgPrice: number
    currentPrice: number
    value: number
    gainLoss: number
    gainLossPercent: number
  }[]
  transactions: {
    id: number
    type: string
    symbol: string
    shares: number
    price: number
    date: string
    total: number
  }[]
  summary: {
    totalValue: number
    totalCost: number
    totalGainLoss: number
    totalGainLossPercent: number
    dayChange: number
    dayChangePercent: number
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const n8nWebhookUrl = Deno.env.get('N8N_PORTFOLIO_WEBHOOK_URL')
    
    if (!n8nWebhookUrl) {
      throw new Error('N8N_PORTFOLIO_WEBHOOK_URL not configured in Supabase secrets')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { userId, portfolioId = 'default', includeTransactions = true, includeAnalytics = true } = await req.json()

    const n8nPayload = {
      trigger: 'portfolio-trigger',
      userId: userId,
      portfolioId: portfolioId,
      includeTransactions: includeTransactions,
      includeAnalytics: includeAnalytics,
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID()
    }

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload)
    })

    if (!n8nResponse.ok) {
      throw new Error(`N8N portfolio webhook failed: ${n8nResponse.statusText}`)
    }

    const n8nData = await n8nResponse.json()
    const portfolioData: PortfolioData = n8nData.portfolio || {}

    // Store portfolio data in Supabase
    if (portfolioData.holdings && portfolioData.holdings.length > 0) {
      // Clear existing holdings
      await supabase
        .from('portfolio_holdings')
        .delete()
        .eq('user_id', userId)
        .eq('portfolio_id', portfolioId)

      // Insert new holdings
      for (const holding of portfolioData.holdings) {
        await supabase
          .from('portfolio_holdings')
          .insert({
            user_id: userId,
            portfolio_id: portfolioId,
            symbol: holding.symbol,
            name: holding.name,
            shares: holding.shares,
            avg_price: holding.avgPrice,
            current_price: holding.currentPrice,
            value: holding.value,
            gain_loss: holding.gainLoss,
            gain_loss_percent: holding.gainLossPercent,
            updated_at: new Date().toISOString()
          })
      }
    }

    // Store transactions
    if (portfolioData.transactions && portfolioData.transactions.length > 0) {
      for (const transaction of portfolioData.transactions) {
        await supabase
          .from('portfolio_transactions')
          .upsert({
            id: transaction.id,
            user_id: userId,
            portfolio_id: portfolioId,
            type: transaction.type,
            symbol: transaction.symbol,
            shares: transaction.shares,
            price: transaction.price,
            date: transaction.date,
            total: transaction.total
          }, {
            onConflict: 'id'
          })
      }
    }

    // Store portfolio summary
    if (portfolioData.summary) {
      await supabase
        .from('portfolio_summary')
        .upsert({
          user_id: userId,
          portfolio_id: portfolioId,
          total_value: portfolioData.summary.totalValue,
          total_cost: portfolioData.summary.totalCost,
          total_gain_loss: portfolioData.summary.totalGainLoss,
          total_gain_loss_percent: portfolioData.summary.totalGainLossPercent,
          day_change: portfolioData.summary.dayChange,
          day_change_percent: portfolioData.summary.dayChangePercent,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,portfolio_id'
        })
    }

    // Log the trigger event
    await supabase
      .from('trigger_logs')
      .insert({
        user_id: userId,
        trigger_type: 'portfolio',
        symbols: null,
        status: 'success',
        response_data: n8nData,
        created_at: new Date().toISOString()
      })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Portfolio trigger executed successfully',
        data: {
          portfolio: portfolioData,
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
    console.error('Portfolio trigger error:', error)
    
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
