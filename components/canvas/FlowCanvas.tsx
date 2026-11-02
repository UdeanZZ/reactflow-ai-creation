"use client";

import { useCallback, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type NodeTypes,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useFlowStore } from "@/store/flowStore";
import { SystemPromptNode } from "@/components/nodes/SystemPromptNode";
import { BehaviorRuleNode } from "@/components/nodes/BehaviorRuleNode";
import { GreetingNode } from "@/components/nodes/GreetingNode";
import { ToneSelectorNode } from "@/components/nodes/ToneSelectorNode";
import { KnowledgeSnippetNode } from "@/components/nodes/KnowledgeSnippetNode";
import { ResponseLengthNode } from "@/components/nodes/ResponseLengthNode";
import type { NodeType } from "@/types/nodes";

// ---------------------------------------------------------------------------
// Default data for newly dropped nodes
// ---------------------------------------------------------------------------

const DEFAULT_NODE_DATA: Record<NodeType, Record<string, unknown>> = {
  systemPrompt: { type: "systemPrompt", label: "System Prompt", persona: "" },
  behaviorRule: { type: "behaviorRule", label: "Behavior Rule", rule: "" },
  greeting: { type: "greeting", label: "Greeting", message: "" },
  toneSelector: { type: "toneSelector", label: "Tone", tone: "friendly" },
  knowledgeSnippet: { type: "knowledgeSnippet", label: "Knowledge", content: "" },
  responseLength: { type: "responseLength", label: "Response Length", length: "medium" },
};

const nodeTypes: NodeTypes = {
  systemPrompt: SystemPromptNode,
  behaviorRule: BehaviorRuleNode,
  greeting: GreetingNode,
  toneSelector: ToneSelectorNode,
  knowledgeSnippet: KnowledgeSnippetNode,
  responseLength: ResponseLengthNode,
};

/**
 * The main ReactFlow canvas. Handles drag-and-drop from the sidebar palette.
 */
export function FlowCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } =
    useFlowStore();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("application/reactflow") as NodeType;
      if (!type || !reactFlowWrapper.current) return;

      // Calculate drop position relative to the canvas wrapper
      const rect = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: e.clientX - rect.left - 128, // center horizontally (node is 256px wide)
        y: e.clientY - rect.top - 40,
      };

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: DEFAULT_NODE_DATA[type],
      };

      addNode(newNode);
    },
    [addNode]
  );

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        deleteKeyCode="Delete"
        proOptions={{ hideAttribution: false }}
      >
        <Background gap={20} size={1} className="!bg-zinc-50 dark:!bg-zinc-950" />
        <Controls className="!border-zinc-200 dark:!border-zinc-700 !bg-white dark:!bg-zinc-900 !shadow-sm" />
        <MiniMap
          nodeColor={(n) => {
            const colorMap: Record<string, string> = {
              systemPrompt: "#7c3aed",
              behaviorRule: "#dc2626",
              greeting: "#059669",
              toneSelector: "#f59e0b",
              knowledgeSnippet: "#0284c7",
              responseLength: "#4f46e5",
            };
            return colorMap[n.type ?? ""] ?? "#94a3b8";
          }}
          className="!border-zinc-200 dark:!border-zinc-700 !bg-white dark:!bg-zinc-900 !rounded-lg overflow-hidden"
        />
      </ReactFlow>
    </div>
  );
}
