import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "attendance_sheet_webhook_url";

const APPS_SCRIPT_TEMPLATE = `// Paste this into Google Apps Script (Extensions > Apps Script)
// Deploy as Web App (Deploy > New Deployment > Web App, access: "Anyone")

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var data = JSON.parse(e.postData.contents);
  
  if (data.type !== 'attendance') {
    return ContentService.createTextOutput(JSON.stringify({error: 'Unknown type'}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var sheetName = "Attendance";
  var ws = sheet.getSheetByName(sheetName) || sheet.insertSheet(sheetName);
  
  var dateCol = -1;
  var lastCol = ws.getLastColumn();
  
  // Check if headers exist
  if (ws.getLastRow() === 0 || ws.getRange(1, 1).getValue() === '') {
    ws.getRange(1, 1).setValue("Name");
    ws.getRange(1, 2).setValue("Role");
    ws.getRange(1, 3).setValue("Phone");
    ws.getRange(1, 1, 1, 3).setFontWeight("bold").setBackground("#4285f4").setFontColor("#ffffff");
    lastCol = 3;
  }
  
  // Find or create date column
  if (lastCol >= 4) {
    for (var c = 4; c <= lastCol; c++) {
      if (ws.getRange(1, c).getValue() === data.summary.date) {
        dateCol = c;
        break;
      }
    }
  }
  
  if (dateCol === -1) {
    dateCol = Math.max(lastCol + 1, 4);
    ws.getRange(1, dateCol).setValue(data.summary.date);
    ws.getRange(1, dateCol).setFontWeight("bold").setBackground("#4285f4").setFontColor("#ffffff");
  }
  
  // Write worker data
  for (var i = 0; i < data.rows.length; i++) {
    var row = data.rows[i];
    var workerRow = -1;
    
    // Find existing worker row
    var lastRow = ws.getLastRow();
    for (var r = 2; r <= lastRow; r++) {
      if (ws.getRange(r, 1).getValue() === row.name) {
        workerRow = r;
        break;
      }
    }
    
    if (workerRow === -1) {
      workerRow = lastRow + 1;
    }
    
    ws.getRange(workerRow, 1).setValue(row.name);
    ws.getRange(workerRow, 2).setValue(row.role);
    ws.getRange(workerRow, 3).setValue(row.phone);
    
    var cell = ws.getRange(workerRow, dateCol);
    cell.setValue(row.abbreviation);
    
    // Color-code
    if (row.abbreviation === 'P') cell.setBackground("#e8f5e9");
    else if (row.abbreviation === 'A') cell.setBackground("#fce4ec");
    else if (row.abbreviation === 'L') cell.setBackground("#fff3e0");
    else if (row.abbreviation === 'RE') cell.setBackground("#f5f5f5");
    else cell.setBackground("#e3f2fd");
  }
  
  // Add legend sheet
  var legendSheet = sheet.getSheetByName("Legend") || sheet.insertSheet("Legend");
  legendSheet.clear();
  legendSheet.getRange("A1:B1").setValues([["Code", "Meaning"]]);
  legendSheet.getRange("A1:B1").setFontWeight("bold").setBackground("#4285f4").setFontColor("#ffffff");
  var legendData = [
    ["P", "Present"], ["PH", "Public Holiday"], ["CL", "Casual Leave"],
    ["A", "Absent"], ["PM", "Permission"], ["AL", "Annual Leave"],
    ["L", "Late"], ["H", "Hospital"], ["OD", "Official Duty"],
    ["ML", "Maternity Leave"], ["RE", "Resigned"]
  ];
  legendSheet.getRange(2, 1, legendData.length, 2).setValues(legendData);
  legendSheet.autoResizeColumns(1, 2);
  
  ws.autoResizeColumns(1, dateCol);
  
  return ContentService.createTextOutput(JSON.stringify({success: true}))
    .setMimeType(ContentService.MimeType.JSON);
}`;

export const AttendanceSheetSync = () => {
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
      const { data, error } = await supabase.functions.invoke("sync-attendance-sheet", {
        body: { webhookUrl },
      });
      if (error) throw new Error(error.message);

      toast({
        title: "Attendance Synced",
        description: `${data?.summary?.total} workers synced for ${data?.summary?.date}`,
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
          <ClipboardList className="h-5 w-5 text-primary" />
          Daily Attendance Sheet Sync
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
            Syncs current worker presence as daily attendance (P, PH, CL, A, PM, AL, L, H, OD, ML, RE).
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSync} disabled={isSyncing} className="gap-2">
            {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardList className="h-4 w-4" />}
            {isSyncing ? "Syncing..." : "Sync Attendance"}
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
