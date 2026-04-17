import { create } from "zustand";
import type { Match, Message } from "../types/match";
import { MOCK_MATCHES, MOCK_MESSAGES } from "../mock-data";
import {
  subscribeToMatches,
  subscribeToMessages,
  sendMessage as firebaseSendMessage,
} from "../firebase/firestore";
import { useAuthStore } from "./auth-store";

interface MatchesState {
  matches: Match[];
  messages: Record<string, Message[]>;
  isLoading: boolean;
  activeSubscriptions: (() => void)[];

  loadMatches: () => void;
  getMessages: (matchId: string) => Message[];
  subscribeChat: (matchId: string) => () => void;
  sendMessage: (matchId: string, text: string) => Promise<void>;
  cleanup: () => void;
}

export const useMatchesStore = create<MatchesState>((set, get) => ({
  matches: [],
  messages: {},
  isLoading: false,
  activeSubscriptions: [],

  loadMatches: () => {
    const { useFirebase, firebaseUser } = useAuthStore.getState();

    if (useFirebase && firebaseUser) {
      set({ isLoading: true });
      const unsubscribe = subscribeToMatches(firebaseUser.uid, (matches) => {
        set({ matches, isLoading: false });
      });
      set((state) => ({
        activeSubscriptions: [...state.activeSubscriptions, unsubscribe],
      }));
      return;
    }

    // Fallback to mock data
    set({ matches: MOCK_MATCHES, messages: MOCK_MESSAGES, isLoading: false });
  },

  getMessages: (matchId: string) => {
    return get().messages[matchId] ?? [];
  },

  subscribeChat: (matchId: string) => {
    const { useFirebase } = useAuthStore.getState();

    if (useFirebase) {
      const unsubscribe = subscribeToMessages(matchId, (messages) => {
        set((state) => ({
          messages: { ...state.messages, [matchId]: messages },
        }));
      });
      set((state) => ({
        activeSubscriptions: [...state.activeSubscriptions, unsubscribe],
      }));
      return unsubscribe;
    }

    // Mock mode - no-op
    return () => {};
  },

  sendMessage: async (matchId: string, text: string) => {
    const { useFirebase, firebaseUser } = useAuthStore.getState();

    if (useFirebase && firebaseUser) {
      await firebaseSendMessage(matchId, firebaseUser.uid, text);
      return;
    }

    // Mock mode - local only
    const newMessage: Message = {
      messageId: `m_${Date.now()}`,
      senderId: "currentUser",
      text,
      type: "text",
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: {
        ...state.messages,
        [matchId]: [...(state.messages[matchId] ?? []), newMessage],
      },
      matches: state.matches.map((m) =>
        m.matchId === matchId
          ? {
              ...m,
              lastMessage: {
                text,
                senderId: "currentUser",
                sentAt: newMessage.createdAt,
              },
            }
          : m
      ),
    }));
  },

  cleanup: () => {
    const { activeSubscriptions } = get();
    activeSubscriptions.forEach((unsub) => unsub());
    set({ activeSubscriptions: [] });
  },
}));
