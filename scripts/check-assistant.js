const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

function loadEnv() {
  const envPath = path.resolve(__dirname, "..", ".env");
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

async function invokeFunction(supabase, name, body) {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    const message = await readFunctionError(error);
    return { ok: false, message };
  }

  return { ok: true, data };
}

async function readFunctionError(error) {
  if (!error.context) return error.message;

  try {
    const payload = await error.context.json();
    return payload.error || payload.message || error.message;
  } catch {
    return error.message;
  }
}

async function main() {
  loadEnv();

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL or anon key is missing from .env.");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false }
  });

  const assistant = await invokeFunction(supabase, "urdu-gemini-assistant", {
    prompt: [
      "You are a financial assistant for a gems and minerals business.",
      "Answer only in Urdu.",
      "Question: اس مہینے کی آمدنی کتنی ہے؟",
      "This month revenue: PKR 12345"
    ].join("\n")
  });

  const liveToken = await invokeFunction(supabase, "gemini-live-token", {});

  console.log(JSON.stringify({
    urduGeminiAssistant: assistant.ok
      ? { ok: true, hasAnswer: Boolean(assistant.data && assistant.data.answer) }
      : { ok: false, message: assistant.message },
    geminiLiveToken: liveToken.ok
      ? { ok: true, hasToken: Boolean(liveToken.data && liveToken.data.token), model: liveToken.data && liveToken.data.model }
      : { ok: false, message: liveToken.message }
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
