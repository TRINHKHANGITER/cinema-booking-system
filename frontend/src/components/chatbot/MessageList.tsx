import type { RefObject } from "react";
import MessageBubble from "./MessageBubble";
import type { ChatMessage, QuickAction } from "../../features/chatbot/types";

type MessageListProps = {
    messages: ChatMessage[];
    quickActions: QuickAction[];
    showQuickActions: boolean;
    onQuickAction: (action: QuickAction) => void;
    messageContainerRef: RefObject<HTMLDivElement | null>;
    disableQuickActions?: boolean;
};

const MessageList = ({
    messages,
    quickActions,
    showQuickActions,
    onQuickAction,
    messageContainerRef,
    disableQuickActions,
}: MessageListProps) => {
    return (
        <div
            ref={messageContainerRef}
            className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-3 py-3"
        >
            {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
            ))}

            {showQuickActions ? (
                <div className="flex flex-wrap gap-2 pt-1">
                    {quickActions.map((action) => (
                        <button
                            key={action.id}
                            type="button"
                            onClick={() => onQuickAction(action)}
                            disabled={disableQuickActions}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#034ea2] hover:text-[#034ea2] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
};

export default MessageList;
