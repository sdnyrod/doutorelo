import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Loader2, Send, User, Sparkles } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { Streamdown } from "streamdown";

/**
 * Message type matching server-side LLM Message interface
 */
export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AIChatBoxProps = {
  /**
   * Messages array to display in the chat.
   * Should match the format used by invokeLLM on the server.
   */
  messages: Message[];

  /**
   * Callback when user sends a message.
   * Typically you'll call a tRPC mutation here to invoke the LLM.
   */
  onSendMessage: (content: string) => void;

  /**
   * Whether the AI is currently generating a response
   */
  isLoading?: boolean;

  /**
   * Placeholder text for the input field
   */
  placeholder?: string;

  /**
   * Custom className for the container
   */
  className?: string;

  /**
   * Height of the chat box (default: 600px)
   */
  height?: string | number;

  /**
   * Empty state message to display when no messages
   */
  emptyStateMessage?: string;

  /**
   * Suggested prompts to display in empty state
   * Click to send directly
   */
  suggestedPrompts?: string[];

  /**
   * Optional draft text to prefill the input without sending automatically.
   */
  initialInput?: string;
};

/**
 * A ready-to-use AI chat box component that integrates with the LLM system.
 *
 * Features:
 * - Matches server-side Message interface for seamless integration
 * - Markdown rendering with Streamdown
 * - Auto-scrolls to latest message
 * - Loading states
 * - Uses global theme colors from index.css
 *
 * @example
 * ```tsx
 * const ChatPage = () => {
 *   const [messages, setMessages] = useState<Message[]>([
 *     { role: "system", content: "You are a helpful assistant." }
 *   ]);
 *
 *   const chatMutation = trpc.ai.chat.useMutation({
 *     onSuccess: (response) => {
 *       // Assuming your tRPC endpoint returns the AI response as a string
 *       setMessages(prev => [...prev, {
 *         role: "assistant",
 *         content: response
 *       }]);
 *     },
 *     onError: (error) => {
 *       console.error("Chat error:", error);
 *       // Optionally show error message to user
 *     }
 *   });
 *
 *   const handleSend = (content: string) => {
 *     const newMessages = [...messages, { role: "user", content }];
 *     setMessages(newMessages);
 *     chatMutation.mutate({ messages: newMessages });
 *   };
 *
 *   return (
 *     <AIChatBox
 *       messages={messages}
 *       onSendMessage={handleSend}
 *       isLoading={chatMutation.isPending}
 *       suggestedPrompts={[
 *         "Explain quantum computing",
 *         "Write a hello world in Python"
 *       ]}
 *     />
 *   );
 * };
 * ```
 */
export function AIChatBox({
  messages,
  onSendMessage,
  isLoading = false,
  placeholder = "Digite sua mensagem...",
  className,
  height = "600px",
  emptyStateMessage = "Comece uma conversa com a IA",
  suggestedPrompts,
  initialInput = "",
}: AIChatBoxProps) {
  const [input, setInput] = useState(initialInput);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputAreaRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!initialInput) return;
    setInput((current) => current || initialInput);
  }, [initialInput]);

  // Filter out system messages
  const displayMessages = messages.filter((msg) => msg.role !== "system");
  const inputFeedback = useMemo(() => {
    const trimmed = input.trim();
    if (trimmed.length === 0) return "Digite sua pergunta em linguagem natural. Pequenos erros de digitação são aceitos.";
    if (trimmed.length === 1) return "Escreva um pouco mais para o Copilot entender sua mensagem com segurança.";
    if (input.length > 900) return "Mensagem longa: priorize contexto, sintomas, tempo de evolução e pergunta principal.";
    return "Enter envia a mensagem. Use Shift + Enter para quebrar linha.";
  }, [input]);

  // Calculate min-height for last assistant message to push user message to top
  const [minHeightForLastMessage, setMinHeightForLastMessage] = useState(0);

  useEffect(() => {
    const calculateLastMessageSpace = () => {
      if (containerRef.current && inputAreaRef.current) {
        const containerHeight = containerRef.current.offsetHeight;
        const inputHeight = inputAreaRef.current.offsetHeight;
        const scrollAreaHeight = containerHeight - inputHeight;

        // Reserve space for:
        // - padding (p-3/p-4 = roughly 24px-32px top+bottom)
        // - user message: 40px (item height) + 16px (margin-top from space-y-4) = 56px
        // Note: margin-bottom is not counted because it naturally pushes the assistant message down
        const userMessageReservedHeight = 56;
        const calculatedHeight = scrollAreaHeight - 32 - userMessageReservedHeight;

        setMinHeightForLastMessage(Math.max(0, calculatedHeight));
      }
    };

    calculateLastMessageSpace();
    window.addEventListener("resize", calculateLastMessageSpace);
    return () => window.removeEventListener("resize", calculateLastMessageSpace);
  }, [height, input.length, displayMessages.length, isLoading]);

  // Scroll to bottom helper function with smooth animation
  const scrollToBottom = () => {
    const viewport = scrollAreaRef.current?.querySelector(
      '[data-radix-scroll-area-viewport]'
    ) as HTMLDivElement;

    if (viewport) {
      requestAnimationFrame(() => {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: 'smooth'
        });
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    onSendMessage(trimmedInput);
    setInput("");

    // Scroll immediately after sending
    scrollToBottom();

    // Keep focus on input
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex min-h-[26rem] max-h-[calc(100svh-9rem)] min-w-0 flex-col rounded-2xl border bg-card text-card-foreground shadow-sm sm:max-h-none",
        className
      )}
      style={{ height }}
    >
      {/* Messages Area */}
      <div ref={scrollAreaRef} className="flex-1 overflow-hidden">
        {displayMessages.length === 0 ? (
          <div className="flex h-full min-h-0 flex-col p-3 sm:p-4">
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 text-center text-muted-foreground sm:gap-6">
              <div className="flex flex-col items-center gap-3">
                <Sparkles className="size-12 opacity-20" />
                <p className="max-w-[28rem] text-sm leading-6">{emptyStateMessage}</p>
              </div>

              {suggestedPrompts && suggestedPrompts.length > 0 && (
                <div className="flex w-full max-w-2xl flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
                  {suggestedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => onSendMessage(prompt)}
                      disabled={isLoading}
                      className="min-h-11 w-full rounded-xl border border-border bg-card px-4 py-2 text-left text-sm font-medium leading-5 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:text-center"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full" role="log" aria-live="polite" aria-relevant="additions text" aria-label="Histórico de mensagens do Copilot">
            <div className="flex min-w-0 flex-col space-y-4 p-3 sm:p-4">
              {displayMessages.map((message, index) => {
                // Apply min-height to last message only if NOT loading (when loading, the loading indicator gets it)
                const isLastMessage = index === displayMessages.length - 1;
                const shouldApplyMinHeight =
                  isLastMessage && !isLoading && minHeightForLastMessage > 0;

                return (
                  <div
                    key={index}
                    className={cn(
                      "flex min-w-0 gap-2 sm:gap-3",
                      message.role === "user"
                        ? "justify-end items-start"
                        : "justify-start items-start"
                    )}
                    style={
                      shouldApplyMinHeight
                        ? { minHeight: `${minHeightForLastMessage}px` }
                        : undefined
                    }
                  >
                    {message.role === "assistant" && (
                      <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:size-8">
                        <Sparkles className="size-4 text-primary" />
                      </div>
                    )}

                    <div
                      className={cn(
                        "min-w-0 max-w-[86%] break-words rounded-2xl px-3 py-2.5 sm:max-w-[80%] sm:px-4",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      )}
                    >
                      {message.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none break-words [&_*]:max-w-full">
                          <Streamdown>{message.content}</Streamdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </p>
                      )}
                    </div>

                    {message.role === "user" && (
                      <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary sm:size-8">
                        <User className="size-4 text-secondary-foreground" />
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div
                  className="flex items-start gap-3"
                  style={
                    minHeightForLastMessage > 0
                      ? { minHeight: `${minHeightForLastMessage}px` }
                      : undefined
                  }
                >
                  <div className="size-8 shrink-0 mt-1 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="size-4 text-primary" />
                  </div>
                  <div className="inline-flex min-h-11 min-w-0 items-center gap-2 rounded-2xl bg-muted px-3 py-2.5 sm:px-4" aria-live="polite" aria-atomic="true">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />
                    <span className="text-sm font-medium text-muted-foreground">Copilot está digitando...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Input Area */}
      <form
        ref={inputAreaRef}
        onSubmit={handleSubmit}
        className="flex min-w-0 items-end gap-2 border-t bg-background/50 p-3 sm:p-4"
      >
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-11 min-w-0 flex-1 resize-none rounded-2xl text-base sm:max-h-32 sm:text-sm"
          rows={1}
          maxLength={1200}
          aria-label="Mensagem para o Copilot"
          aria-describedby="ai-chat-input-feedback ai-chat-input-counter"
          aria-invalid={input.trim().length === 1}
          aria-keyshortcuts="Enter"
        />
        <Button
          type="submit"
          size="icon"
          aria-label="Enviar mensagem"
          disabled={input.trim().length < 2 || isLoading}
          className="min-h-11 min-w-11 shrink-0"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
        <span id="ai-chat-input-feedback" className="sr-only" role="status">{inputFeedback}</span>
        <span id="ai-chat-input-counter" className="sr-only" aria-live="polite">{input.length}/1200</span>
      </form>
    </div>
  );
}
