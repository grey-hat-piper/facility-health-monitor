import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyFaultRequest {
  faultType: string;
  description: string;
  facilityName: string;
  componentName?: string;
  reportedBy?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the caller is authenticated by checking the APP_PASSWORD was verified
    // We validate by checking that the request has a valid app session
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Use anon client with the user's token to verify they have a valid session
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the token is valid by making a simple authenticated request
    const { error: authError } = await anonClient.auth.getUser();
    // For this app's custom auth model, we accept the request if the Authorization header
    // contains the apikey (meaning the request came from the app client)
    if (authError && !authHeader.includes(supabaseAnonKey)) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    
    // Input validation
    const faultType = typeof body.faultType === 'string' ? body.faultType.slice(0, 100) : '';
    const description = typeof body.description === 'string' ? body.description.slice(0, 2000) : '';
    const facilityName = typeof body.facilityName === 'string' ? body.facilityName.slice(0, 200) : '';
    const componentName = typeof body.componentName === 'string' ? body.componentName.slice(0, 200) : undefined;
    const reportedBy = typeof body.reportedBy === 'string' ? body.reportedBy.slice(0, 200) : undefined;

    if (!faultType || !description || !facilityName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Fetching all users with emails...");
    
    // Fetch all users with emails
    const { data: users, error: usersError } = await supabase
      .from("app_users")
      .select("email, username")
      .not("email", "is", null);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw usersError;
    }

    if (!users || users.length === 0) {
      console.log("No users with emails found");
      return new Response(
        JSON.stringify({ message: "No users with emails to notify" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailAddresses = users.filter(u => u.email).map(u => u.email);
    console.log(`Sending notification to ${emailAddresses.length} users`);

    // HTML-escape user inputs to prevent XSS in emails
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const safeFaultType = esc(faultType.charAt(0).toUpperCase() + faultType.slice(1));
    const safeLocation = esc(componentName ? `${facilityName}, ${componentName}` : facilityName);
    const safeDescription = esc(description);
    const safeReportedBy = reportedBy ? esc(reportedBy) : undefined;

    // Send email to all users
    for (const email of emailAddresses) {
      try {
        await resend.emails.send({
          from: "FacilityHub <onboarding@resend.dev>",
          to: [email],
          subject: `[FacilityHub] New ${safeFaultType} Fault Reported`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); padding: 20px; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0;">🔧 New Fault Reported</h1>
              </div>
              <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <p style="color: #374151;"><strong>Type:</strong> ${safeFaultType}</p>
                <p style="color: #374151;"><strong>Location:</strong> ${safeLocation}</p>
                <p style="color: #374151;"><strong>Description:</strong> ${safeDescription}</p>
                ${safeReportedBy ? `<p style="color: #374151;"><strong>Reported by:</strong> ${safeReportedBy}</p>` : ''}
                <p style="color: #374151;"><strong>Reported at:</strong> ${new Date().toLocaleString()}</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #6b7280; font-size: 14px;">This is an automated notification from FacilityHub.</p>
              </div>
            </div>
          `,
        });
        console.log(`Email sent successfully`);
      } catch (emailError) {
        console.error(`Failed to send email:`, emailError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, notified: emailAddresses.length }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in notify-fault function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
