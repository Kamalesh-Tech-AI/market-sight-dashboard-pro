import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const n8nWebhookUrl = Deno.env.get('N8N_NOTIFICATION_WEBHOOK_URL')
    
    if (!n8nWebhookUrl) {
      throw new Error('N8N_NOTIFICATION_WEBHOOK_URL not configured in Supabase secrets')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { title, message, type, userId, timestamp, requestId } = await req.json()

    const n8nPayload = {
      trigger: 'notification-trigger',
      userId: userId,
      notification: {
        title: title,
        message: message,
        type: type,
        timestamp: timestamp
      },
      requestId: requestId
    }

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload)
    })

    if (!n8nResponse.ok) {
      throw new Error(`N8N notification webhook failed: ${n8nResponse.statusText}`)
    }

    const n8nData = await n8nResponse.json()

    // Store notification in database
    const { error: notificationError } = await supabase
      .from('user_notifications')
      .insert({
        user_id: userId,
        title: title,
        message: message,
        type: type,
        read: false,
        created_at: timestamp
      })

    if (notificationError) {
      console.error('Error storing notification:', notificationError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notification trigger executed successfully',
        data: n8nData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Notification trigger error:', error)
    
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
