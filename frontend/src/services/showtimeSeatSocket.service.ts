import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { SeatRoomEvent } from "../types/showtime-seat";

type SeatRoomListener = (event: SeatRoomEvent) => void;

type TopicState = {
    listeners: Set<SeatRoomListener>;
    subscription: StompSubscription | null;
};

class ShowTimeSeatSocketService {
    private client: Client | null = null;
    private connectPromise: Promise<void> | null = null;
    private topics = new Map<number, TopicState>();

    async subscribeShowtime(showTimeId: number, listener: SeatRoomListener): Promise<() => void> {
        const topicState = this.topics.get(showTimeId) ?? {
            listeners: new Set<SeatRoomListener>(),
            subscription: null,
        };
        topicState.listeners.add(listener);
        this.topics.set(showTimeId, topicState);

        await this.connectIfNeeded();
        this.subscribeTopic(showTimeId);
        this.requestSync(showTimeId);

        return () => {
            const current = this.topics.get(showTimeId);
            if (!current) return;
            current.listeners.delete(listener);

            if (current.listeners.size === 0) {
                current.subscription?.unsubscribe();
                this.topics.delete(showTimeId);

                if (this.topics.size === 0) {
                    void this.disconnect();
                }
            }
        };
    }

    async disconnect(): Promise<void> {
        this.connectPromise = null;
        if (!this.client) return;
        const currentClient = this.client;
        this.client = null;
        await currentClient.deactivate();
    }

    private async connectIfNeeded(): Promise<void> {
        if (this.client?.active) return;
        if (this.connectPromise) return this.connectPromise;

        const socketUrl = this.resolveSocketHttpUrl();
        const client = new Client({
            webSocketFactory: () => new SockJS(socketUrl),
            reconnectDelay: 5000,
            debug: () => undefined,
        });

        this.client = client;

        this.connectPromise = new Promise<void>((resolve, reject) => {
            let settled = false;
            client.onConnect = () => {
                for (const showTimeId of this.topics.keys()) {
                    this.subscribeTopic(showTimeId);
                    this.requestSync(showTimeId);
                }
                if (!settled) {
                    settled = true;
                    resolve();
                }
            };
            client.onStompError = () => {
                if (!settled) {
                    settled = true;
                    reject(new Error("STOMP connection failed"));
                }
            };
            client.onWebSocketClose = () => {
                for (const topicState of this.topics.values()) {
                    topicState.subscription = null;
                }
            };
        }).finally(() => {
            this.connectPromise = null;
        });

        client.activate();
        return this.connectPromise;
    }

    private subscribeTopic(showTimeId: number): void {
        if (!this.client?.connected) return;

        const topicState = this.topics.get(showTimeId);
        if (!topicState || topicState.subscription) return;

        topicState.subscription = this.client.subscribe(
            `/topic/showtime/${showTimeId}/seats`,
            (message) => this.handleMessage(showTimeId, message)
        );
    }

    private requestSync(showTimeId: number): void {
        if (!this.client?.connected) return;
        this.client.publish({
            destination: `/app/showtime/${showTimeId}/sync`,
            body: "",
        });
    }

    private handleMessage(showTimeId: number, message: IMessage): void {
        const topicState = this.topics.get(showTimeId);
        if (!topicState || topicState.listeners.size === 0) return;

        try {
            const payload = JSON.parse(message.body) as SeatRoomEvent;
            if (!payload || payload.showTimeId !== showTimeId) return;
            for (const listener of topicState.listeners) {
                listener(payload);
            }
        } catch {
            // Ignore invalid payload.
        }
    }

    private resolveSocketHttpUrl(): string {
        const rawBaseUrl = import.meta.env.VITE_BACKEND_API_URL as string | undefined;
        if (!rawBaseUrl) {
            return `${window.location.origin}/ws`;
        }

        const resolvedApiUrl = new URL(rawBaseUrl, window.location.origin);
        const normalizedPath = resolvedApiUrl.pathname.replace(/\/+$/, "");
        return `${resolvedApiUrl.origin}${normalizedPath}/ws`;
    }
}

export const showTimeSeatSocketService = new ShowTimeSeatSocketService();
