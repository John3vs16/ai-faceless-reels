export default {
  async fetch(request, env) {
    // Allow the frontend to call this Worker
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders()
      });
    }

    if (request.method !== "POST") {
      return json({
        success: false,
        error: "Send a POST request with a video topic."
      }, 405);
    }

    try {
      const body = await request.json();

      const topic = String(body.topic || "").trim();
      const platform = String(body.platform || "TikTok");
      const duration = Number(body.duration || 60);
      const style = String(body.style || "Educational");
      const audience = String(body.audience || "General audience");

      if (!topic) {
        return json({
          success: false,
          error: "Please provide a video topic."
        }, 400);
      }

      const prompt = `
Create a ${duration}-second faceless short-form video plan.

Topic: ${topic}
Platform: ${platform}
Style: ${style}
Audience: ${audience}

Create exactly 8 connected scenes.

Return ONLY valid JSON in this format:

{
  "title": "Video title",
  "hook": "Strong opening hook",
  "narration": "Complete narration",
  "scenes": [
    {
      "scene": 1,
      "duration": "0-7 seconds",
      "visual": "Detailed visual description",
      "voiceover": "Spoken narration",
      "caption": "Short on-screen caption"
    }
  ],
  "cta": "Short call to action"
}

Make the video engaging, educational and suitable for ${platform}.
Do not use Markdown.
Do not put anything before or after the JSON.
`;

      const result = await env.AI.run(
        "@cf/meta/llama-3.1-8b-instruct-fast",
        {
          prompt
        }
      );

      const aiText = result.response || "";

      let video;

      try {
        video = JSON.parse(aiText);
      } catch (parseError) {
        video = {
          title: "AI Faceless Reels",
          hook: "",
          narration: aiText,
          scenes: [],
          cta: ""
        };
      }

      return json({
        success: true,
        topic,
        video
      });

    } catch (error) {
      return json({
        success: false,
        error: error.message || "Worker error"
      }, 500);
    }
  }
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders()
    }
  });
          }
