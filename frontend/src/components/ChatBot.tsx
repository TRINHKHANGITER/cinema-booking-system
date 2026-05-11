import { useEffect, useMemo, useRef, useState } from "react";
import { geminiService } from "../services/gemini.service";
import "./ChatBot.css";

type ChatMode = "agent" | "ask";
type ChatRole = "user" | "bot";

interface ChatMessage {
    id: string;
    role: ChatRole;
    content: string;
    createdAt: number;
    mode: ChatMode;
    isError?: boolean;
}

const STORAGE_KEY = "CINEMA_CHATBOT_MESSAGES_V1";
const MAX_MESSAGES = 20;

const WELCOME_MESSAGE: ChatMessage = {
    id: "welcome-message",
    role: "bot",
    content:
        "Xin chào! Tôi là trợ lý Gemini của hệ thống đặt vé.\n\n" +
        "Bạn có thể chọn:\n" +
        "- Trong hệ thống: hỏi thông tin liên quan tới web bán vé.\n" +
        "- Ngoài hệ thống: hỏi các thông tin chung không liên quan web bán vé.",
    createdAt: Date.now(),
    mode: "agent",
};

function createMessageId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatTime(timestamp: number) {
    return new Date(timestamp).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function normalizeSavedMessages(raw: unknown): ChatMessage[] {
    if (!Array.isArray(raw)) return [];

    return raw
        .filter((item) => typeof item === "object" && item !== null)
        .map((item) => item as Partial<ChatMessage>)
        .filter(
            (item) =>
                typeof item.id === "string" &&
                (item.role === "user" || item.role === "bot") &&
                typeof item.content === "string" &&
                typeof item.createdAt === "number" &&
                (item.mode === "agent" || item.mode === "ask")
        )
        .map((item) => ({
            id: item.id as string,
            role: item.role as ChatRole,
            content: item.content as string,
            createdAt: item.createdAt as number,
            mode: item.mode as ChatMode,
            isError: item.isError === true,
        }))
        .slice(-MAX_MESSAGES);
}

function readLocalHistory(): ChatMessage[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return normalizeSavedMessages(JSON.parse(raw));
    } catch {
        return [];
    }
}

function extractAskAnswer(result: unknown): string {
    if (typeof result === "object" && result !== null) {
        const answer = (result as { answer?: unknown }).answer;
        if (typeof answer === "string" && answer.trim()) {
            return answer.trim();
        }
    }
    return "Tôi chưa nhận được câu trả lời phù hợp từ Gemini.";
}

function extractAgentAnswer(result: unknown): string {
    if (typeof result === "object" && result !== null) {
        const reply = (result as { reply?: unknown }).reply;
        if (typeof reply === "string" && reply.trim()) {
            return reply.trim();
        }
    }
    return "Tôi chưa nhận được câu trả lời phù hợp từ Gemini Agent.";
}

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<ChatMode>("agent");
    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        const localHistory = readLocalHistory();
        return localHistory.length > 0 ? localHistory : [WELCOME_MESSAGE];
    });

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const modeDescription = useMemo(
        () =>
            mode === "agent"
                ? "Hỏi thông tin trong hệ thống bán vé"
                : "Hỏi thông tin chung ngoài hệ thống",
        [mode]
    );

    useEffect(() => {
        const savedMessages = messages
            .filter((message) => message.id !== WELCOME_MESSAGE.id)
            .slice(-MAX_MESSAGES);

        if (savedMessages.length === 0) {
            localStorage.removeItem(STORAGE_KEY);
            return;
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedMessages));
    }, [messages]);

    useEffect(() => {
        if (!isOpen) return;
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const timer = window.setTimeout(() => textareaRef.current?.focus(), 120);
        return () => window.clearTimeout(timer);
    }, [isOpen]);

    const clearHistory = () => {
        localStorage.removeItem(STORAGE_KEY);
        setMessages([WELCOME_MESSAGE]);
    };

    const resetTextareaHeight = () => {
        if (!textareaRef.current) return;
        textareaRef.current.style.height = "auto";
    };

    const handleInputResize = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    };

    const sendMessage = async () => {
        const question = input.trim();
        if (!question || isSending) return;

        const userMessage: ChatMessage = {
            id: createMessageId(),
            role: "user",
            content: question,
            createdAt: Date.now(),
            mode,
        };

        setMessages((prev) => [...prev, userMessage].slice(-MAX_MESSAGES));
        setInput("");
        resetTextareaHeight();
        setIsSending(true);

        try {
            const answer =
                mode === "ask"
                    ? extractAskAnswer((await geminiService.ask(question)).result)
                    : extractAgentAnswer((await geminiService.agent(question)).result);

            const botMessage: ChatMessage = {
                id: createMessageId(),
                role: "bot",
                content: answer,
                createdAt: Date.now(),
                mode,
            };

            setMessages((prev) => [...prev, botMessage].slice(-MAX_MESSAGES));
        } catch {
            const errorMessage: ChatMessage = {
                id: createMessageId(),
                role: "bot",
                content:
                    "Không thể kết nối tới Gemini lúc này. Vui lòng thử lại sau ít phút.",
                createdAt: Date.now(),
                mode,
                isError: true,
            };

            setMessages((prev) => [...prev, errorMessage].slice(-MAX_MESSAGES));
        } finally {
            setIsSending(false);
        }
    };

    const handleTextareaKeyDown = (
        event: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void sendMessage();
        }
    };

    return (
        <>
            <button
                type="button"
                className={`gemini-chatbot__toggle ${isOpen ? "is-open" : ""}`}
                onClick={() => setIsOpen((prev) => !prev)}
                title={isOpen ? "Đóng chat Gemini" : "Mở chat Gemini"}
                aria-label={isOpen ? "Đóng chat Gemini" : "Mở chat Gemini"}
            >
                {isOpen ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M18.3 5.7a1 1 0 0 0-1.4 0L12 10.6 7.1 5.7a1 1 0 1 0-1.4 1.4L10.6 12l-4.9 4.9a1 1 0 0 0 1.4 1.4L12 13.4l4.9 4.9a1 1 0 0 0 1.4-1.4L13.4 12l4.9-4.9a1 1 0 0 0 0-1.4Z" />
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2C6.5 2 2 5.9 2 10.8c0 2.8 1.4 5.3 3.8 7l-1 4.2 4.7-2.4c.8.2 1.7.3 2.5.3 5.5 0 10-3.9 10-8.8S17.5 2 12 2Z" />
                    </svg>
                )}
            </button>

            {!isOpen ? null : (
                <section className="gemini-chatbot__panel" aria-label="Khung chat Gemini">
                    <header className="gemini-chatbot__header">
                        <div className="gemini-chatbot__header-top">
                            <div>
                                <h3>Trợ lý Gemini</h3>
                                <p>Trả lời tự động theo chế độ bạn chọn</p>
                            </div>

                            <button
                                type="button"
                                className="gemini-chatbot__clear-button"
                                onClick={clearHistory}
                            >
                                Xóa lịch sử
                            </button>
                        </div>

                        <div className="gemini-chatbot__mode">
                            <button
                                type="button"
                                className={mode === "agent" ? "active" : ""}
                                onClick={() => setMode("agent")}
                            >
                                Trong hệ thống
                            </button>
                            <button
                                type="button"
                                className={mode === "ask" ? "active" : ""}
                                onClick={() => setMode("ask")}
                            >
                                Ngoài hệ thống
                            </button>
                        </div>
                        <small>{modeDescription}</small>
                    </header>

                    <div className="gemini-chatbot__messages" id="gemini-chatbot-messages">
                        {messages.map((message) => (
                            <MessageItem key={message.id} message={message} />
                        ))}

                        {isSending ? (
                            <div className="gemini-chatbot__typing">
                                <span />
                                <span />
                                <span />
                            </div>
                        ) : null}

                        <div ref={bottomRef} />
                    </div>

                    <footer className="gemini-chatbot__footer">
                        <div className="gemini-chatbot__input-wrap">
                            <textarea
                                ref={textareaRef}
                                value={input}
                                rows={1}
                                maxLength={2000}
                                disabled={isSending}
                                placeholder="Nhập câu hỏi của bạn..."
                                onChange={(event) => setInput(event.target.value)}
                                onInput={handleInputResize}
                                onKeyDown={handleTextareaKeyDown}
                            />
                            <button
                                type="button"
                                onClick={() => void sendMessage()}
                                disabled={isSending || !input.trim()}
                            >
                                Gửi
                            </button>
                        </div>
                        <small>Nhấn Enter để gửi, Shift + Enter để xuống dòng</small>
                    </footer>
                </section>
            )}
        </>
    );
}

function MessageItem({ message }: { message: ChatMessage }) {
    const isUser = message.role === "user";

    return (
        <article
            className={`gemini-chatbot__message ${
                isUser ? "is-user" : "is-bot"
            } ${message.isError ? "is-error" : ""}`}
        >
            <p>{message.content}</p>
            <time>{`${formatTime(message.createdAt)}${
                isUser ? "" : message.mode === "agent" ? " • Trong hệ thống" : " • Ngoài hệ thống"
            }`}</time>
        </article>
    );
}
