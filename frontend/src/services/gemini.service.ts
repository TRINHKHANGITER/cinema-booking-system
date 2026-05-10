import api from "../lib/axios";
import type { ApiResponse } from "../types/api";

export interface GeminiAskResponse {
    answer: string;
}

export interface ChatAgentResponse {
    reply: string;
    type: string;
    payload?: unknown;
}

export const geminiService = {
    /** Hỏi Gemini thông tin ngoài hệ thống (không có tool) */
    ask: async (question: string): Promise<ApiResponse<GeminiAskResponse>> => {
        const res = await api.post<ApiResponse<GeminiAskResponse>>("/gemini/ask", {
            question,
        });
        return res.data;
    },

    /** Hỏi Gemini agent có tool — trả lời thông tin bán vé thật từ hệ thống */
    agent: async (message: string): Promise<ApiResponse<ChatAgentResponse>> => {
        const res = await api.post<ApiResponse<ChatAgentResponse>>("/gemini/agent", {
            message,
        });
        return res.data;
    },
};
