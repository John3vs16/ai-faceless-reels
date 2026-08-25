export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // AI generation endpoint
    if (url.pathname === "/api/generate") {
      if (request.method !== "POST") {
        return Response.json(
          { error: "POST request required" },
          { status: 405 }
        );
      }

      try {
        const body = await request.json();
        const topic = String(body.topic || "").trim();

        if (!topic) {
          return Response.json(
            { error: "Please enter a video topic." },
            { status: 400 }
          );
        }

        const prompt = `Create a TikTok educational video plan about "${topic}".

Return ONLY valid JSON in this exact structure:
{
  "title": "short video title",
  "hook": "attention-grabbing opening",
  "scenes": [
    {
      "time": "0-10 seconds",
      "visual": "what viewers should see",
      "voiceover": "what the narrator says"
    },
    {
      "time": "10-20 seconds",
      "visual": "what viewers should see",
      "voiceover": "what the narrator says"
    },
    {
      "time": "20-30 seconds",
      "visual": "what viewers should see",
      "voiceover": "what the narrator says"
    },
    {
      "time": "30-40 seconds",
      "visual": "what viewers should see",
      "voiceover": "what the narrator says"
    },
    {
      "time": "40-50 seconds",
      "visual": "what viewers should see",
      "voiceover": "what the narrator says"
    },
    {
      "time": "50-60 seconds",
      "visual": "what viewers should see",
      "voiceover": "what the narrator says"
    }
  ],
  "caption": "short TikTok caption",
  "hashtags": ["#AI", "#Technology", "#Education"]
}`;

        const result = await env.AI.run(
          "@cf/meta/llama-3.1-8b-instruct-fast",
          {
            messages: [
              {
                role: "system",
                content: "You create concise educational short-form video plans. Return valid JSON only."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            response_format: {
              type: "json_object"
            },
            max_tokens: 1800,
            temperature: 0.7
          }
        );

        // Workers AI JSON-mode response
        if (typeof result === "object" && result !== null) {
          if (typeof result.response === "string") {
            try {
              return Response.json(JSON.parse(result.response));
            } catch {
              return Response.json({
                title: topic,
                hook: result.response,
                scenes: [],
                caption: topic,
                hashtags: ["#AI", "#Technology", "#Education"]
              });
            }
          }

          return Response.json(result);
        }

        return Response.json({
          title: topic,
          hook: String(result),
          scenes: [],
          caption: topic,
          hashtags: ["#AI", "#Technology", "#Education"]
        });

      } catch (error) {
        return Response.json(
          {
            error: "AI generation failed",
            message: error instanceof Error ? error.message : String(error)
          },
          { status: 500 }
        );
      }
    }

    // Serve the website
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Faceless Reels API is running.", {
      headers: { "Content-Type": "text/plain; charset=UTF-8" }
    });
  }
};
