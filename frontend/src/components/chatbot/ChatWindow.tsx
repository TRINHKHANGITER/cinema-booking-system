import type { KeyboardEvent, RefObject } from "react";
import type { ChatMessage, QuickAction } from "../../features/chatbot/types";
import MessageList from "./MessageList";

type ChatWindowProps = {
    messages: ChatMessage[];
    inputValue: string;
    onInputValueChange: (value: string) => void;
    onSend: () => void;
    onClose: () => void;
    isProcessing: boolean;
    quickActions: QuickAction[];
    showQuickActions: boolean;
    onQuickAction: (action: QuickAction) => void;
    messageContainerRef: RefObject<HTMLDivElement | null>;
};

const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
            d="M6 6L18 18M6 18L18 6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const SendIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
        <path
            d="M4 20L20 12L4 4L4 10L14 12L4 14L4 20Z"
            fill="currentColor"
            stroke="currentColor"
            strokeLinejoin="round"
        />
    </svg>
);

const ChatWindow = ({
    messages,
    inputValue,
    onInputValueChange,
    onSend,
    onClose,
    isProcessing,
    quickActions,
    showQuickActions,
    onQuickAction,
    messageContainerRef,
}: ChatWindowProps) => {
    const canSend = inputValue.trim().length > 0 && !isProcessing;

    const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSend();
        }
    };

    return (
        <section className="flex h-[560px] max-h-[78vh] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.22)]">
            <header className="flex items-center justify-between bg-gradient-to-r from-[#034ea2] to-[#2c82de] px-4 py-3 text-white">
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-wide">Cinema Assistant</h2>
                    <p className="text-[11px] text-white/85">Tim phim, lich chieu va goi y nhanh</p>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full p-1 text-white/85 transition hover:bg-white/15 hover:text-white"
                    aria-label="Dong chatbot"
                >
                    <CloseIcon />
                </button>
            </header>

            <MessageList
                messages={messages}
                quickActions={quickActions}
                showQuickActions={showQuickActions}
                onQuickAction={onQuickAction}
                messageContainerRef={messageContainerRef}
                disableQuickActions={isProcessing}
            />

            <footer className="border-t border-slate-200 bg-white p-3">
                <div className="flex items-end gap-2">
                    <textarea
                        value={inputValue}
                        onChange={(event) => onInputValueChange(event.target.value)}
                        onKeyDown={handleInputKeyDown}
                        placeholder="Nhap cau hoi, vd: Phim Conan chieu luc may gio"
                        rows={1}
                        className="max-h-24 min-h-10 flex-1 resize-y rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#034ea2] focus:ring-2 focus:ring-[#034ea2]/20"
                    />

                    <button
                        type="button"
                        onClick={onSend}
                        disabled={!canSend}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#034ea2] text-white transition hover:bg-[#023f85] disabled:cursor-not-allowed disabled:bg-slate-300"
                        aria-label="Gui tin nhan"
                    >
                        <SendIcon />
                    </button>
                </div>

                <p className="mt-1 text-[11px] text-slate-500">
                    Enter để gửi, Shift + Enter để xuống dòng
                </p>
            </footer>
        </section>
    );
};

export default ChatWindow;
