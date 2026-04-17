import { useState } from "react";
import { useChatbot } from "../../hooks/useChatbot";
import ChatWindow from "./ChatWindow";

const ChatIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
        <path
            d="M8 10H16M8 14H13M7 20L4 21V6.8C4 5.806 4.806 5 5.8 5H18.2C19.194 5 20 5.806 20 6.8V17.2C20 18.194 19.194 19 18.2 19H8L7 20Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const CloseMiniIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
        <path
            d="M6 6L18 18M6 18L18 6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const {
        messages,
        inputValue,
        setInputValue,
        isProcessing,
        sendMessage,
        handleQuickAction,
        showQuickActions,
        quickActions,
        messageContainerRef,
    } = useChatbot();

    const toggleOpen = () => {
        setIsOpen((prev) => !prev);
    };

    const handleSendMessage = () => {
        void sendMessage();
    };

    return (
        <div className="fixed bottom-5 right-5 z-[1200] flex flex-col items-end gap-3">
            <div
                className={`origin-bottom-right transition-all duration-300 ${
                    isOpen
                        ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                        : "pointer-events-none translate-y-2 scale-95 opacity-0"
                }`}
            >
                <ChatWindow
                    messages={messages}
                    inputValue={inputValue}
                    onInputValueChange={setInputValue}
                    onSend={handleSendMessage}
                    onClose={() => setIsOpen(false)}
                    isProcessing={isProcessing}
                    quickActions={quickActions}
                    showQuickActions={showQuickActions}
                    onQuickAction={handleQuickAction}
                    messageContainerRef={messageContainerRef}
                />
            </div>

            <button
                type="button"
                onClick={toggleOpen}
                aria-label={isOpen ? "Dong chat" : "Mo chat"}
                aria-expanded={isOpen}
                className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#034ea2] to-[#2e8ff5] text-white shadow-[0_12px_30px_rgba(3,78,162,0.45)] transition hover:scale-[1.03] hover:shadow-[0_16px_34px_rgba(3,78,162,0.5)]"
            >
                {isOpen ? <CloseMiniIcon /> : <ChatIcon />}
                {!isOpen ? (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 animate-pulse rounded-full bg-orange-400" />
                ) : null}
            </button>
        </div>
    );
};

export default ChatWidget;
