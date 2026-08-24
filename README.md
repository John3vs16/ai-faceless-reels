export default {
  async fetch(request, env) {
    try {
      const result = await env.AI.run(
        "@cf/meta/llama-3.1-8b-instruct-fast",
        {
          prompt: "Write one short viral hook about making money online with AI."
        }
      );

      return new Response(JSON.stringify({
        success: true,
        message: result.response
      }), {
        headers: {
          "Content-Type": "application/json"
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
  }
};
