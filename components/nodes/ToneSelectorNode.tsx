"use client";

import { memo } from "react";
import { useFlowStore } from "@/store/flowStore";
import { BaseNode } from "./BaseNode";
import type { ToneOption } from "@/types/nodes";

interface ToneSelectorNodeProps {
  id: string;
  data: { label: string; tone: ToneOption };
}

const TONE_OPTIONS: { value: ToneOption; label: string; emoji: string }[] = [
  { value: "formal", label: "Formal", emoji: "🎩" },
  { value: "casual", label: "Casual", emoji: "😎" },
  { value: "friendly", label: "Friendly", emoji: "😊" },
  { value: "professional", label: "Professional", emoji: "💼" },
];

export const ToneSelectorNode = memo(function ToneSelectorNode({
  id,
  data,
}: ToneSelectorNodeProps) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);

  return (
    <BaseNode id={id} accentClass="bg-amber-500" title="Tone" icon="🎭">
      <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
        Conversation Tone
      </label>
      <div className="grid grid-cols-2 gap-1.5">
        {TONE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => updateNodeData(id, { tone: opt.value })}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
              data.tone === opt.value
                ? "bg-amber-500 border-amber-500 text-white"
                : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-amber-400"
            }`}
          >
            <span>{opt.emoji}</span>
            {opt.label}
          </button>
        ))}
      </div>
    </BaseNode>
  );
});
