import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const abbreviationMap: Record<string, string> = {
  present: 'P',
  public_holiday: 'PH',
  casual_leave: 'CL',
  absent: 'A',
  permission: 'PM',
  annual_leave: 'AL',
  late: 'L',
  hospital: 'H',
  official_duty: 'OD',
  maternity_leave: 'ML',
  resigned: 'RE',
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

    const { data: workers, error: workersErr } = await supabase
      .from('workers')
      .select('*')
      .order('name');

    if (workersErr) throw workersErr;

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    const rows = (workers || []).map((w: any) => {
      let status: string;
      if (w.is_present) {
        status = 'present';
      } else {
        status = w.absence_reason || 'absent';
      }
      const abbreviation = abbreviationMap[status] || 'A';
      const role = w.role === 'other' && w.custom_role ? w.custom_role : w.role;

      return {
        name: w.name,
        role,
        phone: w.phone_number || '',
        status,
        abbreviation,
      };
    });

    const summary = {
      date: dateStr,
      total: rows.length,
      present: rows.filter((r: any) => r.status === 'present').length,
      absent: rows.filter((r: any) => r.status !== 'present').length,
      synced_at: today.toISOString(),
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'attendance', summary, rows, legend: abbreviationMap }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Google Apps Script returned ${response.status}: ${text}`);
    }

    return new Response(JSON.stringify({ success: true, summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('sync-attendance-sheet error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
