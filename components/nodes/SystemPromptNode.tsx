"use client";

import { memo } from "react";
import { useFlowStore } from "@/store/flowStore";
import { BaseNode } from "./BaseNode";

interface SystemPromptNodeProps {
  id: string;
  data: { label: string; persona: string };
}

export const SystemPromptNode = memo(function SystemPromptNode({
  id,
  data,
}: SystemPromptNodeProps) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);

  return (
    <BaseNode
      id={id}
      accentClass="bg-violet-600"
      title="System Prompt"
      icon="🧠"
      showTarget={false}
    >
      <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
        Persona / Role
      </label>
      <textarea
        value={data.persona}
        onChange={(e) =>
          updateNodeData(id, { persona: e.target.value })
        }
        placeholder="e.g. a friendly barista named Brew…"
        rows={3}
        className="w-full resize-none rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
      />
    </BaseNode>
  );
});
