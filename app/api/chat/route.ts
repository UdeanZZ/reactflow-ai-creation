import { GoogleGenerativeAI } from "@google/generative-ai";
import { configToSystemPrompt } from "@/lib/buildPrompt";
import type { ChatbotConfig } from "@/types/nodes";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return Response.json(
      { error: "GEMINI_API_KEY is not configured. Add it to .env.local." },
      { status: 500 }
    );
  }

  let body: { message: string; config: ChatbotConfig };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { message, config } = body;

  if (!message?.trim()) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }

  const systemPrompt = configToSystemPrompt(config);

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.8-flash",
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(message);
    const reply = result.response.text();

    return Response.json({ reply });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gemini API request failed.";
    return Response.json({ error: message }, { status: 502 });
  }
}
