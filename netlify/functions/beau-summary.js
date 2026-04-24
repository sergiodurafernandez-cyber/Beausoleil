export async function handler(event) {
  const headers = {
    "Content-Type": "application/json"
  };

  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: "Use POST only" })
      };
    }

    const data = JSON.parse(event.body || "{}");

    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: "Summarise this renovation data:\n" + JSON.stringify(data)
      })
    });

    const raw = await res.text();

    if (!res.ok) {
      return {
        statusCode: res.status,
        headers,
        body: JSON.stringify({ error: raw })
      };
    }

    const json = JSON.parse(raw);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        text: json.output_text || "No summary generated"
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
}
