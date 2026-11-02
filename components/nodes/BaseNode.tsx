"use client";

import { memo, type ReactNode } from "react";
import { Handle, Position } from "@xyflow/react";
import { X } from "lucide-react";
import { useFlowStore } from "@/store/flowStore";

interface BaseNodeProps {
  id: string;
  /** Node accent color (Tailwind bg class, e.g. "bg-violet-500") */
  accentClass: string;
  title: string;
  icon: string;
  children: ReactNode;
  /** Show a source handle at the bottom (default true) */
  showSource?: boolean;
  /** Show a target handle at the top (default true) */
  showTarget?: boolean;
}

/**
 * Shared wrapper for all custom node types. Renders handles, a header with
 * title/icon, a delete button, and a white card body for node-specific content.
 */
export const BaseNode = memo(function BaseNode({
  id,
  accentClass,
  title,
  icon,
  children,
  showSource = true,
  showTarget = true,
}: BaseNodeProps) {
  const removeNode = useFlowStore((s) => s.removeNode);

  return (
    <div className="w-64 rounded-xl shadow-lg border border-white/10 overflow-hidden bg-white dark:bg-zinc-900 select-none">
      {showTarget && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !bg-zinc-400 !border-2 !border-white"
        />
      )}

      {/* Header */}
      <div className={`${accentClass} px-3 py-2 flex items-center gap-2`}>
        <span className="text-base">{icon}</span>
        <span className="text-white font-semibold text-sm flex-1 truncate">
          {title}
        </span>
        <button
          onClick={() => removeNode(id)}
          aria-label={`Remove ${title} node`}
          className="text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="p-3">{children}</div>

      {showSource && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !bg-zinc-400 !border-2 !border-white"
        />
      )}
    </div>
  );
});
