// Builds the prompt and calls Gemini. Returns { decision, reason }.
export const getAIRecommendation = async (product, messages, reactions, memberCount) => {
  const chatSummary = messages.map((m) => `${m.sender.name}: ${m.text}`).join("\n");
  const reactionSummary = reactions.map((r) => `${r.user.name} reacted ${r.emoji}`).join(", ");

  // Language adapts based on whether this is actually a group decision or
  // just one person — the prompt used to say "helping a group" unconditionally,
  // which read oddly when there was no group at all.
  const groupContext =
    memberCount > 1
      ? `You are helping a group of ${memberCount} people decide whether to buy a product together.`
      : "You are helping a single shopper decide whether to buy a product.";

  const prompt = `
${groupContext}

Product: ${product.name}
Price: ${product.price}
Rating: ${product.rating || "N/A"}
Description: ${product.description || "N/A"}

Chat, in chronological order (oldest first):
${chatSummary || "No messages yet."}

Reactions:
${reactionSummary || "No reactions yet."}

Important: chat and reactions can sometimes send contradictory signals —
for example someone writing "let's buy this" but also reacting with 👎.
When that happens, don't silently pick a side. Weigh the most recent
signal more heavily, and if the conflict is genuinely unclear, prefer
MAYBE and briefly name the conflict in your reason rather than guessing
confidently.

Based on all of this, respond with ONLY valid JSON, no other text, in this exact shape:
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
