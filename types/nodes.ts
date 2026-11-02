/**
 * Type definitions for all custom ReactFlow node types used in the chatbot builder.
 */

export type NodeType =
  | "systemPrompt"
  | "behaviorRule"
  | "greeting"
  | "toneSelector"
  | "knowledgeSnippet"
  | "responseLength";

export type ToneOption = "formal" | "casual" | "friendly" | "professional";
export type ResponseLengthOption = "short" | "medium" | "detailed";

// ---------------------------------------------------------------------------
// Per-node data shapes
// ---------------------------------------------------------------------------

export interface SystemPromptData {
  label: string;
  persona: string;
}

export interface BehaviorRuleData {
  label: string;
  rule: string;
}

export interface GreetingData {
  label: string;
  message: string;
}

export interface ToneSelectorData {
  label: string;
  tone: ToneOption;
}

export interface KnowledgeSnippetData {
  label: string;
  content: string;
}

export interface ResponseLengthData {
  label: string;
  length: ResponseLengthOption;
}

// Discriminated union for all possible node data
export type NodeData =
  | ({ type: "systemPrompt" } & SystemPromptData)
  | ({ type: "behaviorRule" } & BehaviorRuleData)
  | ({ type: "greeting" } & GreetingData)
  | ({ type: "toneSelector" } & ToneSelectorData)
  | ({ type: "knowledgeSnippet" } & KnowledgeSnippetData)
  | ({ type: "responseLength" } & ResponseLengthData);

// ---------------------------------------------------------------------------
// Node palette item (shown in the sidebar)
// ---------------------------------------------------------------------------

export interface PaletteItem {
  type: NodeType;
  label: string;
  description: string;
  icon: string;
  color: string;
}

// ---------------------------------------------------------------------------
// Chat types
// ---------------------------------------------------------------------------

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ChatbotConfig {
  persona: string;
  rules: string[];
  greeting: string;
  tone: ToneOption;
  knowledge: string[];
  responseLength: ResponseLengthOption;
}
