import { requireSupabase, isSupabaseConfigured } from "@/services/supabase";
import { createPlatformStorage } from "@/services/platformStorage";

const STORAGE_KEY = "platform-credentials:v1";
const storage = createPlatformStorage();

function defaults() {
  return {
    ebay: { clientId: "", clientSecret: "", verificationToken: "", webhookUrl: "", isConnected: false },
    etsy: { apiKey: "", apiSecret: "", webhookUrl: "", isConnected: false }
  };
}

export async function loadCredentials() {
  try {
    if (isSupabaseConfigured) {
      const supabase = requireSupabase();
      const { data, error } = await supabase.from("platform_credentials").select("*");
      if (!error && data?.length > 0) {
        const creds = defaults();
        for (const row of data) {
          if (row.platform === "ebay") {
            creds.ebay = {
              clientId: row.access_token || "",
              clientSecret: row.refresh_token || "",
              verificationToken: "",
              webhookUrl: `https://${supabase.supabaseUrl?.hostname || "project"}/functions/v1/ebay-webhook`,
              isConnected: row.is_connected || false
            };
          }
          if (row.platform === "etsy") {
            creds.etsy = {
              apiKey: row.access_token || "",
              apiSecret: row.refresh_token || "",
              webhookUrl: `https://${supabase.supabaseUrl?.hostname || "project"}/functions/v1/etsy-webhook`,
              isConnected: row.is_connected || false
            };
          }
        }
        await storage.setItem(STORAGE_KEY, JSON.stringify(creds));
        return creds;
      }
    }
    const raw = await storage.getItem(STORAGE_KEY);
    if (raw) return { ...defaults(), ...JSON.parse(raw) };
  } catch {}
  return defaults();
}

export async function saveCredentials(platform, data) {
  const current = await loadCredentials();
  const updated = { ...current, [platform]: { ...current[platform], ...data } };
  await storage.setItem(STORAGE_KEY, JSON.stringify(updated));

  if (isSupabaseConfigured) {
    try {
      const supabase = requireSupabase();
      const existing = await supabase.from("platform_credentials").select("id").eq("platform", platform).single();
      const payload = {
        platform,
        access_token: data.clientId || data.apiKey || "",
        refresh_token: data.clientSecret || data.apiSecret || "",
        is_connected: data.isConnected || false,
        token_expiry: data.isConnected ? new Date(Date.now() + 86400000 * 30).toISOString() : null,
        updated_at: new Date().toISOString()
      };
      if (existing.data?.id) {
        await supabase.from("platform_credentials").update(payload).eq("id", existing.data.id);
      } else {
        payload.created_at = new Date().toISOString();
        await supabase.from("platform_credentials").insert(payload);
      }
    } catch {}
  }
  return updated;
}

export async function disconnectPlatform(platform) {
  return saveCredentials(platform, { isConnected: false });
}

export const PLATFORM_WEBHOOK_URLS = {
  ebay: (ref) => `https://${ref || "hyjfqsxavrykjzmaaasd"}.supabase.co/functions/v1/ebay-webhook`,
  etsy: (ref) => `https://${ref || "hyjfqsxavrykjzmaaasd"}.supabase.co/functions/v1/etsy-webhook`
};
