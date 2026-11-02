"use client";

import { memo } from "react";
import { useFlowStore } from "@/store/flowStore";
import { BaseNode } from "./BaseNode";
import type { ResponseLengthOption } from "@/types/nodes";

interface ResponseLengthNodeProps {
  id: string;
  data: { label: string; length: ResponseLengthOption };
}

const LENGTH_OPTIONS: { value: ResponseLengthOption; label: string; emoji: string; hint: string }[] = [
  { value: "short", label: "Short", emoji: "⚡", hint: "1–3 sentences" },
  { value: "medium", label: "Medium", emoji: "📄", hint: "Balanced" },
  { value: "detailed", label: "Detailed", emoji: "📖", hint: "In-depth" },
];

export const ResponseLengthNode = memo(function ResponseLengthNode({
  id,
  data,
}: ResponseLengthNodeProps) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);

  return (
    <BaseNode id={id} accentClass="bg-indigo-600" title="Response Length" icon="📏">
      <div className="flex flex-col gap-1.5">
        {LENGTH_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => updateNodeData(id, { length: opt.value })}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer text-left ${
              data.length === opt.value
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-indigo-400"
            }`}
          >
            <span>{opt.emoji}</span>
            <span className="flex-1">{opt.label}</span>
            <span className={`text-[10px] ${data.length === opt.value ? "text-indigo-200" : "text-zinc-400"}`}>
              {opt.hint}
            </span>
          </button>
        ))}
      </div>
    </BaseNode>
  );
});
