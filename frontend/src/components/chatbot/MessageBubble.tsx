import MessagePayload from "./MessagePayload";
import type { ChatMessage } from "../../features/chatbot/types";

const LoadingIndicator = () => {
    return (
        <div className="mt-1 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
        </div>
    );
};

const MessageBubble = ({ message }: { message: ChatMessage }) => {
    const isUser = message.sender === "user";
    const isError = message.type === "error";

    const wrapperClassName = isUser ? "justify-end" : "justify-start";
    const bubbleClassName = isUser
        ? "bg-[#034ea2] text-white"
        : isError
          ? "border border-red-200 bg-red-50 text-red-700"
          : "border border-slate-200 bg-white text-slate-800";

    return (
        <div className={`flex w-full ${wrapperClassName}`}>
            <div className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm shadow-sm ${bubbleClassName}`}>
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                {message.type === "loading" ? <LoadingIndicator /> : <MessagePayload message={message} />}
            </div>
        </div>
    );
};

export default MessageBubble;
