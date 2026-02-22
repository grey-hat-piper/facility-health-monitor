import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChecklistItem {
  label: string;
  done: boolean;
}

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

    // Fetch all faults
    const { data: faults, error: faultsErr } = await supabase
      .from('faults')
      .select('*')
      .order('reported_at', { ascending: true });

    if (faultsErr) throw faultsErr;

    // Fetch facilities, components, and app_users for name resolution
    const { data: facilities } = await supabase.from('facilities').select('id, name');
    const { data: components } = await supabase.from('facility_components').select('id, name, facility_id');
    const { data: appUsers } = await supabase.from('app_users').select('id, username');

    const facilityMap = Object.fromEntries((facilities || []).map((f: any) => [f.id, f.name]));
    const componentMap = Object.fromEntries((components || []).map((c: any) => [c.id, c.name]));
    const userMap = Object.fromEntries((appUsers || []).map((u: any) => [u.id, u.username]));

    const defaultChecklist: ChecklistItem[] = [
      { label: 'Memo', done: false },
      { label: 'Head of School', done: false },
      { label: 'Accounts', done: false },
      { label: 'Procurement', done: false },
      { label: 'Director', done: false },
      { label: 'Payment', done: false },
      { label: 'Work Started', done: false },
    ];

    const rows = (faults || []).map((f: any) => {
      const checklist: ChecklistItem[] = (f.checklist && Array.isArray(f.checklist) && f.checklist.length > 0)
        ? f.checklist
        : defaultChecklist;

      const getChecklistStatus = (label: string) => {
        const item = checklist.find((c: ChecklistItem) => c.label === label);
        return item ? (item.done ? 'Done' : 'Pending') : '-';
      };

      const faultType = f.type === 'other' && f.custom_fault_type ? f.custom_fault_type : f.type;
      const facilityName = facilityMap[f.facility_id] || f.facility_id;
      const componentName = f.component_id ? (componentMap[f.component_id] || '') : '';
      const roomSpace = componentName ? `${facilityName}, ${componentName}` : facilityName;

      // Work Started / Work Completed - use updated_at for resolved faults
      const workStartedItem = checklist.find((c: ChecklistItem) => c.label === 'Work Started');
      const workStarted = workStartedItem?.done ? 'Done' : 'Pending';
      const workCompleted = f.status === 'resolved' 
        ? new Date(f.updated_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
        : 'Pending';

      return {
        id: f.id,
        date: new Date(f.reported_at).toISOString().split('T')[0],
        issue: faultType,
        location: facilityName,
        room_space: roomSpace,
        task_details: f.description || '',
        officer: f.assigned_worker_id ? (userMap[f.assigned_worker_id] || '') : '',
        memo: getChecklistStatus('Memo'),
        head_of_school: getChecklistStatus('Head of School'),
        accounts: getChecklistStatus('Accounts'),
        procurement: getChecklistStatus('Procurement'),
        director: getChecklistStatus('Director'),
        payment: getChecklistStatus('Payment'),
        work_started: workStarted,
        work_completed: workCompleted,
        feedback: f.status === 'resolved' ? 'Completed' : (f.status === 'in-progress' ? 'In Progress' : 'Open'),
        status: f.status,
      };
    });

    const summary = {
      total: rows.length,
      synced_at: new Date().toISOString(),
    };

    // Send to Google Apps Script
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'faults_tracking', summary, rows }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Google Apps Script returned ${response.status}: ${text}`);
    }

    return new Response(JSON.stringify({ success: true, summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('sync-faults-sheet error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
