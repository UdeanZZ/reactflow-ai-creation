"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from "@xyflow/react";
import type { ChatMessage } from "@/types/nodes";

// ---------------------------------------------------------------------------
// Initial demo nodes so the canvas isn't empty on first load
// ---------------------------------------------------------------------------

const INITIAL_NODES: Node[] = [
  {
    id: "system-1",
    type: "systemPrompt",
    position: { x: 80, y: 80 },
    data: {
      type: "systemPrompt",
      label: "System Prompt",
      persona: "a friendly barista named Brew who loves coffee trivia",
    },
  },
  {
    id: "tone-1",
    type: "toneSelector",
    position: { x: 80, y: 260 },
    data: { type: "toneSelector", label: "Tone", tone: "friendly" },
  },
  {
    id: "greeting-1",
    type: "greeting",
    position: { x: 80, y: 420 },
    data: {
      type: "greeting",
      label: "Greeting",
      message: "Hey there! ☕ I'm Brew. What can I help you with today?",
    },
  },
];

const INITIAL_EDGES: Edge[] = [
  { id: "e-system-tone", source: "system-1", target: "tone-1", animated: true },
  {
    id: "e-tone-greeting",
    source: "tone-1",
    target: "greeting-1",
    animated: true,
  },
];

// ---------------------------------------------------------------------------
// Store types
// ---------------------------------------------------------------------------

interface FlowState {
  nodes: Node[];
  edges: Edge[];
  chatMessages: ChatMessage[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
  addNode: (node: Node) => void;
  removeNode: (nodeId: string) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  resetFlow: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useFlowStore = create<FlowState>()(
  persist(
    (set) => ({
      nodes: INITIAL_NODES,
      edges: INITIAL_EDGES,
      chatMessages: [],

      onNodesChange: (changes) =>
        set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) })),

      onEdgesChange: (changes) =>
        set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),

      onConnect: (connection) =>
        set((state) => ({ edges: addEdge(connection, state.edges) })),

      updateNodeData: (nodeId, data) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
          ),
        })),

      addNode: (node) =>
        set((state) => ({ nodes: [...state.nodes, node] })),

      removeNode: (nodeId) =>
        set((state) => ({
          nodes: state.nodes.filter((n) => n.id !== nodeId),
          edges: state.edges.filter(
            (e) => e.source !== nodeId && e.target !== nodeId
          ),
        })),

      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        })),

      clearChat: () => set({ chatMessages: [] }),

      resetFlow: () =>
        set({ nodes: INITIAL_NODES, edges: INITIAL_EDGES, chatMessages: [] }),
    }),
    {
      name: "chatbot-flow-storage",
      // Only persist nodes/edges, not chat history
      partialize: (state) => ({ nodes: state.nodes, edges: state.edges }),
    }
  )
);
