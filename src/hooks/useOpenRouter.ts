'use client';

import { useState } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function useOpenRouter(agentId?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (messages: ChatMessage[], model: string = 'openai/gpt-4-turbo') => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, model, agentId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'API error');
      }

      const data = await res.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading, error };
}

// Simple function for one-off completions
export async function chatComplete(
  message: string, 
  agentId?: string,
  model: string = 'openai/gpt-4-turbo'
) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: message }],
      model,
      agentId,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content;
}
