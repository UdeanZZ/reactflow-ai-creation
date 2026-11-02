"use client";

import { memo } from "react";
import { useFlowStore } from "@/store/flowStore";
import { BaseNode } from "./BaseNode";

interface KnowledgeSnippetNodeProps {
  id: string;
  data: { label: string; content: string };
}

export const KnowledgeSnippetNode = memo(function KnowledgeSnippetNode({
  id,
  data,
}: KnowledgeSnippetNodeProps) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);

  return (
    <BaseNode id={id} accentClass="bg-sky-600" title="Knowledge" icon="📚">
      <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
        Context / Facts
      </label>
      <textarea
        value={data.content}
        onChange={(e) => updateNodeData(id, { content: e.target.value })}
        placeholder="e.g. We are open Mon–Fri 8am–6pm. Our specialty is single-origin espresso."
        rows={3}
        className="w-full resize-none rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
      />
    </BaseNode>
  );
});
