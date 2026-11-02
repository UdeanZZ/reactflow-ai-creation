"use client";

import { memo } from "react";
import { useFlowStore } from "@/store/flowStore";
import { BaseNode } from "./BaseNode";

interface BehaviorRuleNodeProps {
  id: string;
  data: { label: string; rule: string };
}

export const BehaviorRuleNode = memo(function BehaviorRuleNode({
  id,
  data,
}: BehaviorRuleNodeProps) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);

  return (
    <BaseNode id={id} accentClass="bg-rose-600" title="Behavior Rule" icon="🚦">
      <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
        Rule / Constraint
      </label>
      <textarea
        value={data.rule}
        onChange={(e) => updateNodeData(id, { rule: e.target.value })}
        placeholder="e.g. Never discuss competitors…"
        rows={2}
        className="w-full resize-none rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
      />
    </BaseNode>
  );
});
