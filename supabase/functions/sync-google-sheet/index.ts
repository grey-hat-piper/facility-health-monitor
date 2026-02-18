import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { webhookUrl } = await req.json();

    if (!webhookUrl || typeof webhookUrl !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing webhookUrl' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate URL format
    try {
      const url = new URL(webhookUrl);
      if (!url.hostname.includes('script.google.com')) {
        return new Response(JSON.stringify({ error: 'URL must be a Google Apps Script URL' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid URL' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current week boundaries (Monday to Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    // Fetch faults for this week
    const { data: faults, error: faultsErr } = await supabase
      .from('faults')
      .select('*')
      .gte('reported_at', monday.toISOString())
      .lte('reported_at', sunday.toISOString())
      .order('reported_at', { ascending: true });

    if (faultsErr) throw faultsErr;

    // Fetch facilities and workers for name resolution
    const { data: facilities } = await supabase.from('facilities').select('id, name');
    const { data: workers } = await supabase.from('workers').select('id, name');
    const { data: components } = await supabase.from('facility_components').select('id, name');

    const facilityMap = Object.fromEntries((facilities || []).map(f => [f.id, f.name]));
    const workerMap = Object.fromEntries((workers || []).map(w => [w.id, w.name]));
    const componentMap = Object.fromEntries((components || []).map(c => [c.id, c.name]));

    const weekLabel = `${monday.toISOString().split('T')[0]} to ${sunday.toISOString().split('T')[0]}`;

    const rows = (faults || []).map(f => ({
      id: f.id,
      facility: facilityMap[f.facility_id] || f.facility_id,
      component: f.component_id ? (componentMap[f.component_id] || f.component_id) : '',
      type: f.type === 'other' && f.custom_fault_type ? f.custom_fault_type : f.type,
      description: (f.description || '').substring(0, 500),
      status: f.status,
      reported_at: f.reported_at,
      assigned_to: f.assigned_worker_id ? (workerMap[f.assigned_worker_id] || '') : '',
    }));

    // Summary stats
    const summary = {
      week: weekLabel,
      total: rows.length,
      open: rows.filter(r => r.status === 'open').length,
      in_progress: rows.filter(r => r.status === 'in-progress').length,
      resolved: rows.filter(r => r.status === 'resolved').length,
      synced_at: now.toISOString(),
    };

    // Send to Google Apps Script
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary, rows }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Google Apps Script returned ${response.status}: ${text}`);
    }

    return new Response(JSON.stringify({ success: true, summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('sync-google-sheet error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
