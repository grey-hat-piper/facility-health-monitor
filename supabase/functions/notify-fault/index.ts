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
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { faultType, description, facilityName, componentName, reportedBy }: NotifyFaultRequest = await req.json();

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

    const location = componentName ? `${facilityName}, ${componentName}` : facilityName;

    // Send email to all users
    for (const email of emailAddresses) {
      try {
        await resend.emails.send({
          from: "FacilityHub <onboarding@resend.dev>",
          to: [email],
          subject: `[FacilityHub] New ${faultType} Fault Reported`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); padding: 20px; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0;">🔧 New Fault Reported</h1>
              </div>
              <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <p style="color: #374151;"><strong>Type:</strong> ${faultType.charAt(0).toUpperCase() + faultType.slice(1)}</p>
                <p style="color: #374151;"><strong>Location:</strong> ${location}</p>
                <p style="color: #374151;"><strong>Description:</strong> ${description}</p>
                ${reportedBy ? `<p style="color: #374151;"><strong>Reported by:</strong> ${reportedBy}</p>` : ''}
                <p style="color: #374151;"><strong>Reported at:</strong> ${new Date().toLocaleString()}</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #6b7280; font-size: 14px;">This is an automated notification from FacilityHub.</p>
              </div>
            </div>
          `,
        });
        console.log(`Email sent to ${email}`);
      } catch (emailError) {
        console.error(`Failed to send email to ${email}:`, emailError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, notified: emailAddresses.length }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in notify-fault function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
