import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CHATBOT_QUICK_ACTIONS } from "../features/chatbot/constants";
import { createChatbotOrchestrator } from "../features/chatbot/orchestrator";
import type { BotMessageDraft, ChatMessage, QuickAction } from "../features/chatbot/types";

const DEFAULT_ERROR_MESSAGE =
    "He thong chatbot tam thoi bi loi khi lay du lieu. Ban thu lai sau it phut nhe.";

const mapErrorMessage = (error: unknown): string => {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return DEFAULT_ERROR_MESSAGE;
};

export const useChatbot = () => {
    const orchestrator = useMemo(() => createChatbotOrchestrator(), []);
    const messageCounterRef = useRef(0);
    const messageContainerRef = useRef<HTMLDivElement | null>(null);

    const createMessageId = useCallback((): string => {
        messageCounterRef.current += 1;
        return `chat-${Date.now()}-${messageCounterRef.current}`;
    }, []);

    const createMessage = useCallback(
        (sender: "user" | "bot", draft: BotMessageDraft): ChatMessage => {
            const base = {
                id: createMessageId(),
                sender,
                createdAt: Date.now(),
            };

            switch (draft.type) {
                case "movie_list":
                    return {
                        ...base,
                        type: "movie_list",
                        content: draft.content,
                        payload: draft.payload,
                    };
                case "genre_list":
                    return {
                        ...base,
                        type: "genre_list",
                        content: draft.content,
                        payload: draft.payload,
                    };
                case "showtime_list":
                    return {
                        ...base,
                        type: "showtime_list",
                        content: draft.content,
                        payload: draft.payload,
                    };
                case "suggestion":
                    return {
                        ...base,
                        type: "suggestion",
                        content: draft.content,
                        payload: draft.payload,
                    };
                case "error":
                    return {
                        ...base,
                        type: "error",
                        content: draft.content,
                    };
                case "loading":
                    return {
                        ...base,
                        type: "loading",
                        content: draft.content,
                    };
                default:
                    return {
                        ...base,
                        type: "text",
                        content: draft.content,
                    };
            }
        },
        [createMessageId]
    );

    const [messages, setMessages] = useState<ChatMessage[]>(() => [
        {
            id: "chat-greeting-1",
            sender: "bot",
            createdAt: Date.now(),
            type: "text",
            content:
                "Xin chào! Mình là trợ lý chat cinema, có thể tìm phim, thể loại và lịch chiếu cho bạn.",
        },
        {
            id: "chat-greeting-2",
            sender: "bot",
            createdAt: Date.now(),
            type: "text",
            content: "Bạn có thể bấm quick action bến dưới hoặc nhập câu hỏi tự do.",
        },
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    useEffect(() => {
        const container = messageContainerRef.current;
        if (!container) return;

        container.scrollTop = container.scrollHeight;
    }, [messages, isProcessing]);

    const sendMessage = useCallback(
        async (rawText?: string) => {
            const textToSend = (rawText ?? inputValue).trim();
            if (!textToSend || isProcessing) {
                return;
            }

            setHasInteracted(true);
            setInputValue("");

            const userMessage = createMessage("user", {
                type: "text",
                content: textToSend,
            });

            const loadingMessage = createMessage("bot", {
                type: "loading",
                content: "Đang xu ly yeu cau...",
            });

            setMessages((prev) => [...prev, userMessage, loadingMessage]);
            setIsProcessing(true);

            try {
                const botDrafts = await orchestrator.handleUserMessage(textToSend);
                const botMessages = botDrafts.map((draft) => createMessage("bot", draft));

                setMessages((prev) => {
                    const withoutLoading = prev.filter((message) => message.id !== loadingMessage.id);
                    return [...withoutLoading, ...botMessages];
                });
            } catch (error) {
                const errorMessage = createMessage("bot", {
                    type: "error",
                    content: mapErrorMessage(error),
                });

                setMessages((prev) => {
                    const withoutLoading = prev.filter((message) => message.id !== loadingMessage.id);
                    return [...withoutLoading, errorMessage];
                });
            } finally {
                setIsProcessing(false);
            }
        },
        [createMessage, inputValue, isProcessing, orchestrator]
    );

    const handleQuickAction = useCallback(
        (action: QuickAction) => {
            void sendMessage(action.query);
        },
        [sendMessage]
    );

    return {
        messages,
        inputValue,
        setInputValue,
        isProcessing,
        sendMessage,
        handleQuickAction,
        showQuickActions: !hasInteracted,
        quickActions: CHATBOT_QUICK_ACTIONS,
        messageContainerRef,
    };
};
