"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { NodePalette } from "@/components/sidebar/NodePalette";
import { FlowCanvas } from "@/components/canvas/FlowCanvas";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { useFlowStore } from "@/store/flowStore";

/**
 * Top-level client component that composes the three-panel layout:
 * [Node Palette] | [Flow Canvas] | [Chat Preview]
 *
 * ReactFlowProvider must wrap FlowCanvas since it uses ReactFlow hooks.
 */
export function BuilderView() {
  const resetFlow = useFlowStore((s) => s.resetFlow);

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Navbar */}
      <header className="shrink-0 flex items-center justify-between px-4 h-12 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <span className="font-bold text-sm text-zinc-800 dark:text-zinc-100">
            Chatbot Builder
          </span>
          <span className="hidden sm:block text-xs text-zinc-400 ml-1">
            — drag nodes, connect them, chat
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://ai.google.dev/gemini-api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
          >
            Powered by Gemini ✦
          </a>
        </div>
      </header>

      {/* Three-panel body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Node palette */}
        <NodePalette onResetFlow={resetFlow} />

        {/* Center: ReactFlow canvas */}
        <ReactFlowProvider>
          <FlowCanvas />
        </ReactFlowProvider>

        {/* Right: Chat preview */}
        <aside className="w-80 shrink-0 flex flex-col border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <ChatInterface />
        </aside>
      </div>
    </div>
  );
}
