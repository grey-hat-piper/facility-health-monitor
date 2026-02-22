import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "faults_sheet_webhook_url";

const APPS_SCRIPT_TEMPLATE = `// Paste this into Google Apps Script (Extensions > Apps Script)
// Deploy as Web App (Deploy > New Deployment > Web App, access: "Anyone")

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var data = JSON.parse(e.postData.contents);
  
  if (data.type !== 'faults_tracking') {
    return ContentService.createTextOutput(JSON.stringify({error: 'Unknown type'}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var sheetName = "Faults Tracking";
  var ws = sheet.getSheetByName(sheetName) || sheet.insertSheet(sheetName);
  
  // Set headers if empty
  if (ws.getLastRow() === 0 || ws.getRange(1, 1).getValue() === '') {
    var headers = [
      "Date", "Issue", "Location", "Room/Space", "Task Details",
      "Officer in Charge", "MEMO", "HEAD OF SCHOOL", "ACCOUNTS",
      "PROCUREMENT", "DIRECTOR", "PAYMENT", "WORK STARTED",
      "WORK COMPLETED", "FEEDBACK"
    ];
    ws.getRange(1, 1, 1, headers.length).setValues([headers]);
    ws.getRange(1, 1, 1, headers.length)
      .setFontWeight("bold")
      .setBackground("#4285f4")
      .setFontColor("#ffffff")
      .setHorizontalAlignment("center");
    ws.setFrozenRows(1);
  }
  
  // Process each fault row
  for (var i = 0; i < data.rows.length; i++) {
    var fault = data.rows[i];
    var existingRow = -1;
    
    // Find existing row by fault ID (stored in column 16 as hidden ref)
    var lastRow = ws.getLastRow();
    for (var r = 2; r <= lastRow; r++) {
      var note = ws.getRange(r, 1).getNote();
      if (note === fault.id) {
        existingRow = r;
        break;
      }
    }
    
    var targetRow = existingRow > 0 ? existingRow : lastRow + 1;
    
    var rowData = [
      fault.date,
      fault.issue,
      fault.location,
      fault.room_space,
      fault.task_details,
      fault.officer,
      fault.memo,
      fault.head_of_school,
      fault.accounts,
      fault.procurement,
      fault.director,
      fault.payment,
      fault.work_started,
      fault.work_completed,
      fault.feedback
    ];
    
    ws.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);
    // Store fault ID as note on date cell for future updates
    ws.getRange(targetRow, 1).setNote(fault.id);
    
    // Color-code status columns (MEMO through WORK COMPLETED: cols 7-14)
    for (var col = 7; col <= 14; col++) {
      var val = rowData[col - 1];
      var cell = ws.getRange(targetRow, col);
      if (val === 'Done' || (val !== 'Pending' && val !== '' && val !== '-')) {
        cell.setBackground("#e8f5e9").setFontColor("#2e7d32");
      } else if (val === 'Pending') {
        cell.setBackground("#fff3e0").setFontColor("#e65100");
      } else {
        cell.setBackground("#ffffff").setFontColor("#000000");
      }
    }
    
    // Color-code status by fault status
    var statusColor = "#ffffff";
    if (fault.status === 'open') statusColor = "#fce4ec";
    else if (fault.status === 'in-progress') statusColor = "#fff3e0";
    else if (fault.status === 'resolved') statusColor = "#e8f5e9";
    ws.getRange(targetRow, 2).setBackground(statusColor);
  }
  
  ws.autoResizeColumns(1, 15);
  
  return ContentService.createTextOutput(JSON.stringify({success: true, count: data.rows.length}))
    .setMimeType(ContentService.MimeType.JSON);
}`;

export const FaultsSheetSync = () => {
  const [webhookUrl, setWebhookUrlState] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setWebhookUrlState(localStorage.getItem(STORAGE_KEY) || "");
  }, []);

  const handleUrlChange = (url: string) => {
    setWebhookUrlState(url);
    localStorage.setItem(STORAGE_KEY, url);
  };

  const handleSync = async () => {
    if (!webhookUrl.trim()) {
      toast({ title: "Missing URL", description: "Enter your Google Apps Script web app URL.", variant: "destructive" });
      return;
    }

    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-faults-sheet", {
        body: { webhookUrl },
      });
      if (error) throw new Error(error.message);

      toast({
        title: "Faults Synced",
        description: `${data?.summary?.total} faults synced to Google Sheets`,
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
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          Faults Tracking Sheet Sync
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Apps Script Web App URL</Label>
          <Input
            placeholder="https://script.google.com/macros/s/.../exec"
            value={webhookUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Syncs all faults with procurement checklist progress to Google Sheets.
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSync} disabled={isSyncing} className="gap-2">
            {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
            {isSyncing ? "Syncing..." : "Sync Faults"}
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
