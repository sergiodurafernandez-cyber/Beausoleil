export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Use POST to generate Beau summary." }),
      };
    }

    let data;
    try {
      data = JSON.parse(event.body || "{}");
    } catch {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Invalid JSON payload sent to Beau." }),
      };
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              "You are Beau, a concise renovation project assistant. Summarise budget, risks, blockers, notes, and next actions clearly.",
          },
          {
            role: "user",
            content: JSON.stringify(data),
          },
        ],
      }),
    });

    const raw = await response.text();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "OpenAI API error",
          detail: raw.slice(0, 500),
        }),
      };
    }

    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      return {
        statusCode: 502,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "OpenAI returned a non-JSON response",
          detail: raw.slice(0, 500),
        }),
      };
    }

    const text =
      result.output_text ||
      result.output?.[0]?.content?.[0]?.text ||
      "Beau generated a response, but the text could not be extracted.";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
}
