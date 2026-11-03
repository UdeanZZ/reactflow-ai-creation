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

  // ── Incoming request ──────────────────────────────────────────────────────
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║           CHAT REQUEST RECEIVED           ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log("📨 User message:", message);
  console.log("🔧 Chatbot config:", JSON.stringify(config, null, 2));

  const systemPrompt = configToSystemPrompt(config);

  console.log("\n📋 Assembled system prompt:");
  console.log("─────────────────────────────────────────────");
  console.log(systemPrompt);
  console.log("─────────────────────────────────────────────");

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.8-flash",
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContentStream(message);

    // Collect the full response text for logging while streaming to the client.
    let fullResponse = "";
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              fullResponse += text;
              controller.enqueue(encoder.encode(text));
            }
          }
          // ── Bot response ───────────────────────────────────────────────
          console.log("\n🤖 Bot response:");
          console.log("─────────────────────────────────────────────");
          console.log(fullResponse);
          console.log("─────────────────────────────────────────────\n");
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        // Prevent any proxy/CDN from buffering the stream
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gemini API request failed.";
    return Response.json({ error: message }, { status: 502 });
  }
}
