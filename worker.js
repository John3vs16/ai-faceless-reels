// ── CORS preflight ──────────────────────────────────────────
if (request.method === "OPTIONS") {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
}

// ── Serve static assets for non-API requests ──────────────
if (url.pathname !== "/api/generate") {
  if (env.ASSETS) {
    return env.ASSETS.fetch(request);
  }
  return new Response("Faceless Reels API is running.", {
    headers: { "Content-Type": "text/plain; charset=UTF-8" }
  });
}

// ── Only POST allowed on /api/generate ─────────────────────
if (request.method !== "POST") {
  return jsonResponse({ success: false, error: "POST request required" }, 405);
}

// ── Parse request body ─────────────────────────────────────
let body;
try {
  body = await request.json();
} catch {
  return jsonResponse({ success: false, error: "Invalid JSON body" }, 400);
}

const topic = String(body.topic || "").trim();
if (!topic) {
  return jsonResponse({ success: false, error: "Please enter a video topic." }, 400);
}

const platform = String(body.platform || "TikTok");
const duration = Number(body.duration) || 60;
const style = String(body.style || "Educational");
const audience = String(body.audience || "general audience");

// ── Build AI prompt ─────────────────────────────────────────
const prompt = `Create a ${duration}-second ${style} video plan for ${platform} about "${topic}".
