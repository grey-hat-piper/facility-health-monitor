import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const APPS_SCRIPT_TEMPLATE = `// Paste this entire script into Google Apps Script (Extensions > Apps Script)
// Then deploy as Web App (Deploy > New Deployment > Web App, set access to "Anyone")

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var data = JSON.parse(e.postData.contents);
  
  var summarySheet = sheet.getSheetByName("Summary") || sheet.insertSheet("Summary");
  var faultsSheet = sheet.getSheetByName("Weekly Faults") || sheet.insertSheet("Weekly Faults");
  
  // Clear and write summary
  summarySheet.clear();
  summarySheet.getRange("A1:B1").setValues([["Weekly Fault Report", data.summary.week]]);
  summarySheet.getRange("A1:B1").setFontWeight("bold").setFontSize(14);
  summarySheet.getRange("A3:B7").setValues([
    ["Total Faults", data.summary.total],
    ["Open", data.summary.open],
    ["In Progress", data.summary.in_progress],
    ["Resolved", data.summary.resolved],
    ["Last Synced", data.summary.synced_at]
  ]);
  summarySheet.getRange("A3:A7").setFontWeight("bold");
  summarySheet.autoResizeColumns(1, 2);
  
  // Clear and write fault details
  faultsSheet.clear();
  var headers = ["Facility", "Component", "Type", "Description", "Status", "Reported At", "Assigned To"];
  faultsSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  faultsSheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#4285f4").setFontColor("#ffffff");
  
  if (data.rows.length > 0) {
    var rows = data.rows.map(function(r) {
      return [r.facility, r.component, r.type, r.description, r.status, r.reported_at, r.assigned_to];
    });
    faultsSheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    
    // Color-code status
    for (var i = 0; i < rows.length; i++) {
      var statusCell = faultsSheet.getRange(i + 2, 5);
      if (rows[i][4] === "open") statusCell.setBackground("#fce4ec");
      else if (rows[i][4] === "in-progress") statusCell.setBackground("#fff3e0");
      else if (rows[i][4] === "resolved") statusCell.setBackground("#e8f5e9");
    }
  }
  
  faultsSheet.autoResizeColumns(1, headers.length);
  
  return ContentService.createTextOutput(JSON.stringify({success: true}))
    .setMimeType(ContentService.MimeType.JSON);
}`;

export const GoogleSheetSync = () => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const { toast } = useToast();

  const handleSync = async () => {
    if (!webhookUrl.trim()) {
      toast({ title: "Missing URL", description: "Enter your Google Apps Script web app URL.", variant: "destructive" });
      return;
    }

    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-google-sheet', {
        body: { webhookUrl: webhookUrl.trim() },
      });

      if (error) throw error;

      toast({
        title: "Synced to Google Sheets",
        description: `${data.summary.total} faults for week ${data.summary.week}`,
      });
    } catch (err: any) {
      toast({
        title: "Sync Failed",
        description: err.message || "Check your webhook URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sheet className="h-5 w-5 text-primary" />
          Google Sheets Sync
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Apps Script Web App URL</Label>
          <Input
            placeholder="https://script.google.com/macros/s/.../exec"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Sends this week's faults to your Google Sheet.
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSync} disabled={isSyncing} className="gap-2">
            {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sheet className="h-4 w-4" />}
            {isSyncing ? "Syncing..." : "Sync Now"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowScript(!showScript)}>
            {showScript ? "Hide" : "Show"} Setup Script
          </Button>
        </div>

        {showScript && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Google Apps Script Code</Label>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
                  toast({ title: "Copied!", description: "Paste into Google Apps Script editor." });
                }}
              >
                Copy
              </Button>
            </div>
            <pre className="bg-muted rounded-lg p-3 text-xs overflow-auto max-h-60 whitespace-pre-wrap font-mono">
              {APPS_SCRIPT_TEMPLATE}
            </pre>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Create a new Google Sheet</li>
              <li>Go to <strong>Extensions → Apps Script</strong></li>
              <li>Replace the code with the script above and save</li>
              <li>Click <strong>Deploy → New deployment → Web App</strong></li>
              <li>Set "Who has access" to <strong>Anyone</strong></li>
              <li>Copy the URL and paste it above</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
