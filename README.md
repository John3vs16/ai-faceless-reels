export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("AI Worker is running. Send a POST request.", {
        status: 200
      });
    }

    try {
      const body = await request.json();

      const topic = body.topic || "AI";
      const platform = body.platform || "TikTok";
      const duration = body.duration || 60;
      const style = body.style || "Educational";
      const audience = body.audience || "Beginners";

      const prompt = `Create a ${duration}-second ${platform} faceless video about "${topic}".
Style: ${style}.
Audience: ${audience}.

Return ONLY valid JSON:
{
  "title": "title",
  "hook": "strong hook",
  "narration": "short narration",
  "scenes": [
    {
      "scene": 1,
      "duration": "0-7 seconds",
      "visual": "visual description",
      "voiceover": "voiceover",
      "caption": "caption"
    }
  ],
  "cta": "call to action"
}

Create exactly 8 connected scenes. No Markdown.`;

      const result = await env.AI.run(
        "@cf/meta/llama-3.1-8b-instruct-fast",
        { prompt }
      );

      return new Response(JSON.stringify({
        success: true,
        video: result.response
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });

    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
};
