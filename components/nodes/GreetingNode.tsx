"use client";

import { memo } from "react";
import { useFlowStore } from "@/store/flowStore";
import { BaseNode } from "./BaseNode";

interface GreetingNodeProps {
  id: string;
  data: { label: string; message: string };
}

export const GreetingNode = memo(function GreetingNode({
  id,
  data,
}: GreetingNodeProps) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);

  return (
    <BaseNode id={id} accentClass="bg-emerald-600" title="Greeting" icon="👋" showSource={false}>
      <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
        Opening Message
      </label>
      <textarea
        value={data.message}
        onChange={(e) => updateNodeData(id, { message: e.target.value })}
        placeholder="e.g. Hey! I'm Brew. How can I help you today?"
        rows={2}
        className="w-full resize-none rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
      />
    </BaseNode>
  );
});
