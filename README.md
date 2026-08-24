export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders()
      });
    }

    if (request.method !== "POST") {
      return json(
        { error: "Send a POST request with a topic." },
        405
      );
    }

    try {
      const body = await request.json();
      const topic = body.topic;

      if (!topic) {
        return json(
          { error: "Please provide a video topic." },
          400
        );
      }

      const prompt = `
Create a complete 60-second faceless short-form video plan.

Topic: ${topic}

Platform: TikTok
Style: educational
Length: 60 seconds
Audience: general social-media viewers

Return ONLY valid JSON using this structure:

{
  "title": "video title",
  "hook": "powerful opening hook",
  "narration": "complete 60-second narration",
  "scenes": [
    {
      "scene": 1,
      "duration": "0-7 seconds",
      "visual": "detailed visual description",
      "voiceover": "spoken words",
      "caption": "short on-screen caption"
    }
  ],
  "cta": "short ending call to action"
}

Create exactly 8 connected scenes.
Make the narration natural and engaging.
Each scene must continue logically from the previous scene.
Do not include markdown or explanations outside the JSON.
`;

      const result = await env.AI.run(
        "@cf/meta/llama-3.1-8b-instruct-fast",
        {
          prompt: prompt
        }
      );

      const text = result.response || "";

      let plan;

      try {
        plan = JSON.parse(text);
      } catch {
        plan = {
          raw_response: text
        };
      }

      return json({
        success: true,
        topic: topic,
        video: plan
      });

    } catch (error) {
      return json(
        {
          success: false,
          error: error.message
        },
        500
      );
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
    status: status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders()
    }
  });
}
