import React, { useState, useRef, useEffect, useCallback } from "react";
import { geminiService } from "../services/gemini.service";

/* ─────────────────────────── Types ─────────────────────────── */
type Mode = "ask" | "agent";
type Role = "user" | "bot";

interface Message {
    id: string;
    role: Role;
    text: string;
    timestamp: number;
    mode: Mode;
    isError?: boolean;
}

/* ─────────────────────────── Constants ─────────────────────── */
const LS_KEY = "CINEMA_CHATBOT_HISTORY";
const MAX_MESSAGES = 20;

const WELCOME_MESSAGE: Message = {
    id: "welcome",
    role: "bot",
    text: "Xin chào! 👋 Tôi là trợ lý AI của CinemaSystem.\n\n🎬 **Chế độ Hệ thống**: Hỏi tôi về phim đang chiếu, lịch chiếu, rạp, giá vé...\n🌐 **Chế độ Tự do**: Hỏi bất kỳ câu hỏi nào khác.\n\nBạn muốn biết gì hôm nay?",
    timestamp: Date.now(),
    mode: "agent",
};

/* ─────────────────────────── Helpers ───────────────────────── */
function loadHistory(): Message[] {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as Message[];
    } catch {
        return [];
    }
}

function saveHistory(msgs: Message[]) {
    const trimmed = msgs.slice(-MAX_MESSAGES);
    localStorage.setItem(LS_KEY, JSON.stringify(trimmed));
}

function genId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatTime(ts: number) {
    return new Date(ts).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

/** Render markdown đơn giản: **bold**, *italic*, xuống dòng */
function renderMarkdown(text: string): React.ReactNode {
    const lines = text.split("\n");
    return lines.map((line, i) => {
        const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
        return (
            <React.Fragment key={i}>
                {parts.map((part, j) => {
                    if (part.startsWith("**") && part.endsWith("**")) {
                        return <strong key={j}>{part.slice(2, -2)}</strong>;
                    }
                    if (part.startsWith("*") && part.endsWith("*")) {
                        return <em key={j}>{part.slice(1, -1)}</em>;
                    }
                    return <span key={j}>{part}</span>;
                })}
                {i < lines.length - 1 && <br />}
            </React.Fragment>
        );
    });
}

/* ─────────────────────────── Component ─────────────────────── */
export default function ChatBot() {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<Mode>("agent");
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>(() => {
        const hist = loadHistory();
        return hist.length > 0 ? hist : [WELCOME_MESSAGE];
    });

    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    /* Lưu lịch sử khi messages thay đổi */
    useEffect(() => {
        const real = messages.filter((m) => m.id !== "welcome");
        if (real.length > 0) saveHistory(real);
    }, [messages]);

    /* Cuộn xuống cuối khi có tin nhắn mới */
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, open]);

    /* Focus input khi mở chat */
    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 150);
    }, [open]);

    const clearHistory = () => {
        localStorage.removeItem(LS_KEY);
        setMessages([WELCOME_MESSAGE]);
    };

    const sendMessage = useCallback(async () => {
        const text = input.trim();
        if (!text || loading) return;

        const userMsg: Message = {
            id: genId(),
            role: "user",
            text,
            timestamp: Date.now(),
            mode,
        };

        setMessages((prev) => {
            const next = [...prev, userMsg].slice(-MAX_MESSAGES);
            return next;
        });
        setInput("");
        setLoading(true);

        try {
            let botText = "";
            if (mode === "ask") {
                const res = await geminiService.ask(text);
                botText = res.result?.answer ?? "Không có phản hồi.";
            } else {
                const res = await geminiService.agent(text);
                botText = res.result?.reply ?? "Không có phản hồi.";
            }

            const botMsg: Message = {
                id: genId(),
                role: "bot",
                text: botText,
                timestamp: Date.now(),
                mode,
            };

            setMessages((prev) => [...prev, botMsg].slice(-MAX_MESSAGES));
        } catch {
            const errMsg: Message = {
                id: genId(),
                role: "bot",
                text: "⚠️ Xin lỗi, đã xảy ra lỗi khi kết nối. Vui lòng thử lại sau.",
                timestamp: Date.now(),
                mode,
                isError: true,
            };
            setMessages((prev) => [...prev, errMsg].slice(-MAX_MESSAGES));
        } finally {
            setLoading(false);
        }
    }, [input, loading, mode]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    /* ─── Render ─── */
    return (
        <>
            {/* ── Nút mở chatbot ── */}
            <button
                id="chatbot-toggle-btn"
                onClick={() => setOpen((v) => !v)}
                title="Trợ lý AI"
                style={{
                    position: "fixed",
                    bottom: "28px",
                    right: "28px",
                    zIndex: 9999,
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #034ea2 0%, #0a6dd6 100%)",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(3,78,162,0.45)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 6px 28px rgba(3,78,162,0.6)";
                }}
                onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 4px 20px rgba(3,78,162,0.45)";
                }}
            >
                {open ? (
                    /* Icon X */
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                ) : (
                    /* Icon chat */
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2C6.477 2 2 6.105 2 11.184c0 2.836 1.357 5.373 3.5 7.1L4.5 22l4.25-2.13A11.3 11.3 0 0 0 12 20.367c5.523 0 10-4.104 10-9.183S17.523 2 12 2Z" />
                    </svg>
                )}

                {/* Badge chấm xanh lá */}
                {!open && (
                    <span style={{
                        position: "absolute",
                        top: "6px",
                        right: "6px",
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: "#22c55e",
                        border: "2px solid white",
                    }} />
                )}
            </button>

            {/* ── Khung chat ── */}
            {open && (
                <div
                    id="chatbot-window"
                    style={{
                        position: "fixed",
                        bottom: "100px",
                        right: "28px",
                        zIndex: 9998,
                        width: "390px",
                        maxWidth: "calc(100vw - 40px)",
                        height: "580px",
                        maxHeight: "calc(100vh - 140px)",
                        background: "#ffffff",
                        borderRadius: "20px",
                        boxShadow: "0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        animation: "chatSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                    }}
                >
                    {/* ── Header ── */}
                    <div style={{
                        background: "linear-gradient(135deg, #034ea2 0%, #0a6dd6 100%)",
                        padding: "16px 18px 12px",
                        flexShrink: 0,
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                            {/* Avatar bot */}
                            <div style={{
                                width: "38px",
                                height: "38px",
                                borderRadius: "50%",
                                background: "rgba(255,255,255,0.2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}>
                                <span style={{ fontSize: "20px" }}>🎬</span>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ color: "white", fontWeight: 700, fontSize: "15px" }}>
                                    Trợ lý CinemaSystem
                                </div>
                                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "12px", display: "flex", alignItems: "center", gap: "5px" }}>
                                    <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                                    Trực tuyến
                                </div>
                            </div>
                            {/* Nút xoá lịch sử */}
                            <button
                                id="chatbot-clear-btn"
                                onClick={clearHistory}
                                title="Xoá lịch sử"
                                style={{
                                    background: "rgba(255,255,255,0.15)",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "5px 8px",
                                    cursor: "pointer",
                                    color: "white",
                                    fontSize: "11px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                }}
                            >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                                </svg>
                                Xoá
                            </button>
                        </div>

                        {/* ── Toggle chế độ ── */}
                        <div style={{
                            background: "rgba(255,255,255,0.15)",
                            borderRadius: "10px",
                            padding: "3px",
                            display: "flex",
                        }}>
                            {(["agent", "ask"] as Mode[]).map((m) => (
                                <button
                                    key={m}
                                    id={`chatbot-mode-${m}`}
                                    onClick={() => setMode(m)}
                                    style={{
                                        flex: 1,
                                        padding: "6px 0",
                                        borderRadius: "8px",
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: "12px",
                                        fontWeight: mode === m ? 700 : 400,
                                        background: mode === m ? "white" : "transparent",
                                        color: mode === m ? "#034ea2" : "rgba(255,255,255,0.85)",
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    {m === "agent" ? "🎬 Hệ thống" : "🌐 Tự do"}
                                </button>
                            ))}
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "11px", marginTop: "6px", textAlign: "center" }}>
                            {mode === "agent"
                                ? "Hỏi về phim, lịch chiếu, rạp, giá vé..."
                                : "Hỏi bất kỳ điều gì ngoài hệ thống"}
                        </div>
                    </div>

                    {/* ── Messages ── */}
                    <div
                        id="chatbot-messages"
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: "16px 14px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                            background: "#f6f8fc",
                        }}
                    >
                        {messages.map((msg) => (
                            <MessageBubble key={msg.id} msg={msg} />
                        ))}

                        {/* Loading dots */}
                        {loading && (
                            <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                                <BotAvatar />
                                <div style={{
                                    background: "white",
                                    borderRadius: "16px 16px 16px 4px",
                                    padding: "12px 16px",
                                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                                    display: "flex",
                                    gap: "5px",
                                    alignItems: "center",
                                }}>
                                    {[0, 1, 2].map((i) => (
                                        <span key={i} style={{
                                            width: "7px",
                                            height: "7px",
                                            borderRadius: "50%",
                                            background: "#034ea2",
                                            display: "inline-block",
                                            animation: `chatDot 1.2s ${i * 0.2}s infinite ease-in-out`,
                                        }} />
                                    ))}
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* ── Input area ── */}
                    <div style={{
                        padding: "12px 14px",
                        borderTop: "1px solid #e5eaf2",
                        background: "white",
                        flexShrink: 0,
                    }}>
                        <div style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "flex-end",
                            background: "#f1f5f9",
                            borderRadius: "14px",
                            padding: "8px 8px 8px 14px",
                            border: "1.5px solid transparent",
                            transition: "border-color 0.2s",
                        }}
                            onFocus={(e) => (e.currentTarget.style.borderColor = "#034ea2")}
                            onBlur={(e) => (e.currentTarget.style.borderColor = "transparent")}
                        >
                            <textarea
                                ref={inputRef}
                                id="chatbot-input"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={mode === "agent" ? "Hỏi về phim, lịch chiếu..." : "Nhập câu hỏi của bạn..."}
                                rows={1}
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    border: "none",
                                    background: "transparent",
                                    resize: "none",
                                    outline: "none",
                                    fontSize: "14px",
                                    lineHeight: "1.5",
                                    maxHeight: "100px",
                                    overflowY: "auto",
                                    fontFamily: "inherit",
                                    color: "#1f2937",
                                }}
                                onInput={(e) => {
                                    const el = e.currentTarget;
                                    el.style.height = "auto";
                                    el.style.height = Math.min(el.scrollHeight, 100) + "px";
                                }}
                            />
                            <button
                                id="chatbot-send-btn"
                                onClick={sendMessage}
                                disabled={loading || !input.trim()}
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "10px",
                                    border: "none",
                                    background: loading || !input.trim()
                                        ? "#cbd5e1"
                                        : "linear-gradient(135deg, #034ea2, #0a6dd6)",
                                    cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    transition: "background 0.2s",
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13" />
                                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                </svg>
                            </button>
                        </div>
                        <div style={{ textAlign: "center", fontSize: "11px", color: "#94a3b8", marginTop: "6px" }}>
                            Enter để gửi · Shift+Enter xuống dòng
                        </div>
                    </div>
                </div>
            )}

            {/* ── CSS Animations ── */}
            <style>{`
                @keyframes chatSlideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to   { opacity: 1; transform: translateY(0)   scale(1);    }
                }
                @keyframes chatDot {
                    0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
                    40%           { transform: scale(1);   opacity: 1;   }
                }
                #chatbot-messages::-webkit-scrollbar { width: 4px; }
                #chatbot-messages::-webkit-scrollbar-track { background: transparent; }
                #chatbot-messages::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
            `}</style>
        </>
    );
}

/* ─────────────────────────── Sub-components ─────────────────── */
function BotAvatar() {
    return (
        <div style={{
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #034ea2, #0a6dd6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: "14px",
        }}>
            🤖
        </div>
    );
}

function MessageBubble({ msg }: { msg: Message }) {
    const isUser = msg.role === "user";

    if (isUser) {
        return (
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", alignItems: "flex-end" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", maxWidth: "80%" }}>
                    <div style={{
                        background: "linear-gradient(135deg, #034ea2 0%, #0a6dd6 100%)",
                        color: "white",
                        borderRadius: "18px 18px 4px 18px",
                        padding: "10px 14px",
                        fontSize: "14px",
                        lineHeight: "1.5",
                        boxShadow: "0 1px 4px rgba(3,78,162,0.2)",
                        wordBreak: "break-word",
                    }}>
                        {msg.text}
                    </div>
                    <span style={{ fontSize: "10px", color: "#94a3b8", marginTop: "3px" }}>
                        {formatTime(msg.timestamp)}
                    </span>
                </div>
                {/* Avatar người dùng */}
                <div style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: "#e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: "14px",
                }}>
                    👤
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
            <BotAvatar />
            <div style={{ display: "flex", flexDirection: "column", maxWidth: "82%" }}>
                <div style={{
                    background: msg.isError ? "#fef2f2" : "white",
                    color: msg.isError ? "#991b1b" : "#1f2937",
                    borderRadius: "18px 18px 18px 4px",
                    padding: "10px 14px",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    border: msg.isError ? "1px solid #fecaca" : "1px solid #f1f5f9",
                    wordBreak: "break-word",
                }}>
                    {renderMarkdown(msg.text)}
                </div>
                <span style={{ fontSize: "10px", color: "#94a3b8", marginTop: "3px" }}>
                    {formatTime(msg.timestamp)} ·{" "}
                    <span style={{
                        color: msg.mode === "agent" ? "#034ea2" : "#f58020",
                        fontWeight: 600,
                    }}>
                        {msg.mode === "agent" ? "Hệ thống" : "Tự do"}
                    </span>
                </span>
            </div>
        </div>
    );
}
