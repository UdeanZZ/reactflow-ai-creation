"use client";

import type { DragEvent } from "react";
import type { PaletteItem } from "@/types/nodes";

const PALETTE_ITEMS: PaletteItem[] = [
  {
    type: "systemPrompt",
    label: "System Prompt",
    description: "Define the AI's persona and role",
    icon: "🧠",
    color: "border-violet-400 bg-violet-50 dark:bg-violet-950/30",
  },
  {
    type: "behaviorRule",
    label: "Behavior Rule",
    description: "Add a constraint or rule",
    icon: "🚦",
    color: "border-rose-400 bg-rose-50 dark:bg-rose-950/30",
  },
  {
    type: "greeting",
    label: "Greeting",
    description: "Set the opening message",
    icon: "👋",
    color: "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    type: "toneSelector",
    label: "Tone",
    description: "Choose the conversation style",
    icon: "🎭",
    color: "border-amber-400 bg-amber-50 dark:bg-amber-950/30",
  },
  {
    type: "knowledgeSnippet",
    label: "Knowledge",
    description: "Inject background context",
    icon: "📚",
    color: "border-sky-400 bg-sky-50 dark:bg-sky-950/30",
  },
  {
    type: "responseLength",
    label: "Response Length",
    description: "Control how verbose the AI is",
    icon: "📏",
    color: "border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30",
  },
];

interface NodePaletteProps {
  onResetFlow: () => void;
}

/**
 * Left sidebar showing draggable node tiles and a reset button.
 */
export function NodePalette({ onResetFlow }: NodePaletteProps) {
  function onDragStart(e: DragEvent<HTMLDivElement>, type: string) {
    e.dataTransfer.setData("application/reactflow", type);
    e.dataTransfer.effectAllowed = "move";
  }

  return (
    <aside
      className="w-56 shrink-0 flex flex-col gap-3 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 overflow-y-auto"
      aria-label="Node palette"
    >
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
          Drag to Canvas
        </h2>
        <div className="flex flex-col gap-1.5">
          {PALETTE_ITEMS.map((item) => (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => onDragStart(e, item.type)}
              className={`flex items-start gap-2 p-2 rounded-lg border cursor-grab active:cursor-grabbing transition hover:shadow-sm ${item.color}`}
              role="button"
              tabIndex={0}
              aria-label={`Drag ${item.label} node onto canvas`}
            >
              <span className="text-lg leading-none mt-0.5">{item.icon}</span>
              <div>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">
                  {item.label}
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-zinc-200 dark:border-zinc-700">
        <button
          onClick={onResetFlow}
          className="w-full text-xs text-zinc-500 dark:text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 transition py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
          aria-label="Reset canvas to default"
        >
          ↺ Reset to default
        </button>
      </div>
    </aside>
  );
}
