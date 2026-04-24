export async function handler(event) {
  try {
    const data = JSON.parse(event.body);

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `You are Beau, a renovation project assistant.

Summarise this data clearly and concisely:

${JSON.stringify(data)}

Return:
1. Executive summary
2. Budget risks
3. Open questions
4. Suggested next actions`
      })
    });

    const result = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        text: result.output[0].content[0].text
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
