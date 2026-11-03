"use client";

import { useState, useRef, useEffect, useCallback, type FormEvent } from "react";
import { Send, RotateCcw, Bot } from "lucide-react";
import { useFlowStore } from "@/store/flowStore";
import { buildConfig } from "@/lib/buildPrompt";
import type { ChatMessage } from "@/types/nodes";

// ---------------------------------------------------------------------------
// StreamingBubble
// Renders already-committed text plus the live streaming suffix, animating
// each new word as it arrives (ChatGPT-style).
// ---------------------------------------------------------------------------

interface StreamingBubbleProps {
  /** The full text accumulated so far from the stream */
  content: string;
  /** Word index to start animating from — words before this are "settled" */
  animateFromWord: number;
}

function StreamingBubble({ content, animateFromWord }: StreamingBubbleProps) {
  // Split on whitespace but keep the separator so spaces are preserved
  const words = content.split(/(\s+)/);

  let wordIdx = 0;
  return (
    <span>
      {words.map((fragment, i) => {
        // Whitespace-only fragments are not real words — render as-is
        if (/^\s+$/.test(fragment)) {
          return <span key={i}>{fragment}</span>;
        }
        const idx = wordIdx++;
        const shouldAnimate = idx >= animateFromWord;
        return (
          <span
            key={i}
            className={shouldAnimate ? "animate-word-appear" : undefined}
            style={
              shouldAnimate
                ? { animationDelay: `${Math.max(0, (idx - animateFromWord) * 18)}ms` }
                : undefined
            }
          >
            {fragment}
          </span>
        );
      })}
    </span>
  );
}

// ---------------------------------------------------------------------------
// ChatInterface
// ---------------------------------------------------------------------------

/**
 * Full chat UI that reads the current flow config and talks to the Gemini
 * API via the `/api/chat` route handler.  Responses are streamed and rendered
 * word-by-word with a fade-in animation.
 */
export function ChatInterface() {
  const { nodes, edges, chatMessages, addChatMessage, clearChat } =
    useFlowStore();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * While streaming, we hold the partial reply here.  Once the stream is
   * finished we move the text into the persistent store and clear this.
   */
  const [streamingContent, setStreamingContent] = useState<string | null>(null);
  /**
   * The word index at which we started the current streaming turn — used by
   * StreamingBubble to know which words are "new" (should animate).
   */
  const animateFromWordRef = useRef(0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const config = buildConfig(nodes, edges);

  // Scroll to bottom when new messages or streaming content arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, streamingContent]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const text = input.trim();
      if (!text || loading) return;

      setInput("");
      setError(null);

      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: Date.now(),
      };
      addChatMessage(userMsg);
      setLoading(true);

      // Reset streaming state for a fresh turn
      animateFromWordRef.current = 0;
      setStreamingContent("");

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, config }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error ?? `Request failed (${response.status})`);
        }

        // The route now returns text/plain as a ReadableStream
        if (!response.body) throw new Error("No response body.");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          // Track the word boundary so StreamingBubble only animates new words
          const prevWordCount = accumulated.split(/\s+/).filter(Boolean).length;
          accumulated += chunk;
          animateFromWordRef.current = prevWordCount;

          setStreamingContent(accumulated);
        }

        // Stream finished — commit to the persistent store
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          content: accumulated,
          timestamp: Date.now(),
        };
        addChatMessage(assistantMsg);
        setStreamingContent(null);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setStreamingContent(null);
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [input, loading, config, addChatMessage]
  );

  // Determine the greeting to show in the empty state
  const greeting = config.greeting || "Hello! How can I help you today?";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-violet-500" />
          <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-100">
            Chat Preview
          </span>
        </div>
        {chatMessages.length > 0 && (
          <button
            onClick={clearChat}
            aria-label="Clear chat"
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer"
          >
            <RotateCcw size={12} />
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {chatMessages.length === 0 && streamingContent === null ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-2xl">
              🤖
            </div>
            <div className="max-w-xs">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                {greeting}
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Configure the chatbot using the canvas, then start chatting.
              </p>
            </div>
          </div>
        ) : (
          <>
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-violet-600 text-white rounded-br-sm"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Live streaming bubble */}
            {streamingContent !== null && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm leading-relaxed bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100">
                  {streamingContent.length === 0 ? (
                    /* Still waiting for the very first chunk — show the dots */
                    <span className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
                    </span>
                  ) : (
                    <StreamingBubble
                      content={streamingContent}
                      animateFromWord={animateFromWordRef.current}
                    />
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {error && (
          <div
            role="alert"
            className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg px-3 py-2"
          >
            {error}
          </div>
        )}

        <div ref={bottomRef} aria-hidden="true" />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="px-3 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0"
      >
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as unknown as FormEvent);
              }
            }}
            placeholder="Type a message…"
            rows={1}
            disabled={loading}
            aria-label="Chat input"
            className="flex-1 resize-none rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-400 transition disabled:opacity-50 max-h-32 overflow-y-auto"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className="shrink-0 w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center hover:bg-violet-700 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
