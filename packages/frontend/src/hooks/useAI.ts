import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getAccessToken } from '../lib/api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIConversation {
  id: string;
  title?: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

const AI_KEY = 'ai-conversations';

export function useAIConversations() {
  return useQuery({
    queryKey: [AI_KEY],
    queryFn: async () => {
      const { data } = await api.get<AIConversation[]>('/ai/conversations');
      return data;
    },
  });
}

export function useSaveConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { title?: string; messages: ChatMessage[] }) => {
      const { data } = await api.post<AIConversation>('/ai/conversations', body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [AI_KEY] }),
  });
}

export function useDeleteConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/ai/conversations/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [AI_KEY] }),
  });
}

interface StreamingState {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
}

export function useAIChat() {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';
  const [state, setState] = useState<StreamingState>({
    messages: [],
    isStreaming: false,
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (userMessage: string) => {
      const userMsg: ChatMessage = { role: 'user', content: userMessage };
      const newMessages: ChatMessage[] = [...state.messages, userMsg];

      setState((prev) => ({
        ...prev,
        messages: newMessages,
        isStreaming: true,
        error: null,
      }));

      abortRef.current = new AbortController();
      let assistantText = '';

      try {
        const token = getAccessToken();
        const response = await fetch(`${BASE_URL}/api/ai/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ messages: newMessages }),
          signal: abortRef.current.signal,
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error('No response body');

        setState((prev) => ({
          ...prev,
          messages: [...newMessages, { role: 'assistant', content: '' }],
        }));

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;

            try {
              const event = JSON.parse(raw) as { text?: string; done?: boolean };
              if (event.text) {
                assistantText += event.text;
                setState((prev) => {
                  const msgs = [...prev.messages];
                  msgs[msgs.length - 1] = { role: 'assistant', content: assistantText };
                  return { ...prev, messages: msgs };
                });
              }
            } catch {
              // partial JSON — skip
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setState((prev) => ({
            ...prev,
            error: (err as Error).message,
          }));
        }
      } finally {
        setState((prev) => ({ ...prev, isStreaming: false }));
      }
    },
    [state.messages, BASE_URL],
  );

  const cancelStream = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clearMessages = useCallback(() => {
    setState({ messages: [], isStreaming: false, error: null });
  }, []);

  const loadConversation = useCallback((conversation: AIConversation) => {
    setState({ messages: conversation.messages, isStreaming: false, error: null });
  }, []);

  return {
    messages: state.messages,
    isStreaming: state.isStreaming,
    error: state.error,
    sendMessage,
    cancelStream,
    clearMessages,
    loadConversation,
  };
}
