export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Worker is running"
        }),
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    if (!env.AI) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "AI binding is missing"
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "AI binding is connected"
      }),
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
};
