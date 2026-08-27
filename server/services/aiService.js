// Builds the prompt and calls Gemini. Returns { decision, reason }.
export const getAIRecommendation = async (product, messages, reactions) => {
  const chatSummary = messages.map((m) => `${m.sender.name}: ${m.text}`).join("\n");
  const reactionSummary = reactions.map((r) => `${r.user.name} reacted ${r.emoji}`).join(", ");

  const prompt = `
You are helping a group decide whether to buy a product together.

Product: ${product.name}
Price: ${product.price}
Rating: ${product.rating || "N/A"}
Description: ${product.description || "N/A"}

Group chat about this product:
${chatSummary || "No messages yet."}

Reactions:
${reactionSummary || "No reactions yet."}

Based on this, respond with ONLY valid JSON, no other text, in this exact shape:
{"decision": "BUY" | "SKIP" | "MAYBE", "reason": "one short sentence explaining why"}
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );

  const data = await response.json();

  // If Gemini rejects the request (bad key, deprecated model, rate limit),
  // it returns an { error: {...} } shape instead of { candidates: [...] }.
  // Fail loudly here with the real reason, instead of crashing confusingly
  // on data.candidates[0] a few lines down.
  if (!response.ok || !data.candidates) {
    console.error("Gemini API error:", JSON.stringify(data));
    throw new Error(data.error?.message || "Gemini API request failed");
  }

  const rawText = data.candidates[0].content.parts[0].text;

  // Gemini sometimes wraps JSON in ```json fences — strip those before parsing
  const cleaned = rawText.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
};
