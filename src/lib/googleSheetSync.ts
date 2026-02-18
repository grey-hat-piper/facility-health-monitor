import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "google_sheet_webhook_url";

export const getGoogleSheetWebhookUrl = (): string => {
  return localStorage.getItem(STORAGE_KEY) || "";
};

export const setGoogleSheetWebhookUrl = (url: string) => {
  localStorage.setItem(STORAGE_KEY, url);
};

export const syncToGoogleSheet = async (): Promise<{ success: boolean; summary?: any; error?: string }> => {
  const webhookUrl = getGoogleSheetWebhookUrl();
  if (!webhookUrl) return { success: false, error: "No webhook URL configured" };

  const { data, error } = await supabase.functions.invoke("sync-google-sheet", {
    body: { webhookUrl },
  });

  if (error) return { success: false, error: error.message };
  return { success: true, summary: data?.summary };
};
