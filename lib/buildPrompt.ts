import type { Node, Edge } from "@xyflow/react";
import type { ChatbotConfig, NodeData, ToneOption, ResponseLengthOption } from "@/types/nodes";

/**
 * Traverses the node graph in topological order and assembles a ChatbotConfig
 * that is later serialized into a Gemini system prompt.
 */
export function buildConfig(nodes: Node[], _edges: Edge[]): ChatbotConfig {
  const config: ChatbotConfig = {
    persona: "",
    rules: [],
    greeting: "",
    tone: "friendly",
    knowledge: [],
    responseLength: "medium",
  };

  for (const node of nodes) {
    const data = node.data as unknown as NodeData;

    switch (data.type) {
      case "systemPrompt":
        if (data.persona.trim()) {
          config.persona = data.persona.trim();
        }
        break;

      case "behaviorRule":
        if (data.rule.trim()) {
          config.rules.push(data.rule.trim());
        }
        break;

      case "greeting":
        if (data.message.trim()) {
          config.greeting = data.message.trim();
        }
        break;

      case "toneSelector":
        config.tone = data.tone as ToneOption;
        break;

      case "knowledgeSnippet":
        if (data.content.trim()) {
          config.knowledge.push(data.content.trim());
        }
        break;

      case "responseLength":
        config.responseLength = data.length as ResponseLengthOption;
        break;
    }
  }

  return config;
}

/**
 * Converts a ChatbotConfig into a system prompt string for Gemini.
 */
export function configToSystemPrompt(config: ChatbotConfig): string {
  const lines: string[] = [];

  if (config.persona) {
    lines.push(`You are ${config.persona}.`);
  } else {
    lines.push("You are a helpful AI assistant.");
  }

  const toneMap: Record<string, string> = {
    formal: "Use formal, professional language at all times.",
    casual: "Use a casual, relaxed tone — like talking to a friend.",
    friendly: "Be warm, friendly, and approachable in all responses.",
    professional:
      "Maintain a polished, professional tone throughout the conversation.",
  };
  lines.push(toneMap[config.tone] ?? toneMap.friendly);

  const lengthMap: Record<string, string> = {
    short: "Keep all responses brief — ideally 1-3 sentences.",
    medium: "Aim for clear, concise responses of moderate length.",
    detailed:
      "Provide thorough, detailed explanations when answering questions.",
  };
  lines.push(lengthMap[config.responseLength] ?? lengthMap.medium);

  if (config.rules.length > 0) {
    lines.push("\nRules you must follow:");
    config.rules.forEach((rule, i) => {
      lines.push(`${i + 1}. ${rule}`);
    });
  }

  if (config.knowledge.length > 0) {
    lines.push("\nContextual knowledge you have access to:");
    config.knowledge.forEach((snippet) => {
      lines.push(`- ${snippet}`);
    });
  }

  return lines.join("\n");
}
