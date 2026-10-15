import React, { useState, useRef, useEffect } from 'react';
import { chatWithAgent } from '../services/chat';
import type { ChatMessage } from '../types';
import { Brain, User, Send, Sparkles } from 'lucide-react';

interface ChatProps {
  userEmail: string | null;
}

export default function Chat({ userEmail }: ChatProps) {
  const userName = userEmail
    ? userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1)
    : 'You';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'agent',
      text: 'Hello! I am RecallFlow, your personal productivity assistant. How can I help you manage your schedule, plan your tasks, or recall important details today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestions = [
    { label: 'Check my tasks', query: 'What are my pending tasks?' },
    { label: 'Schedule an event', query: 'Schedule a meeting tomorrow at 3 PM' },
    { label: 'Save a memory', query: 'Remember that my flight leaves at 8 PM on Thursday' },
    { label: 'Recall preferences', query: 'What do you remember about my preferences?' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatWithAgent(trimmed);

      const agentMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: res.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, agentMsg]);

      // Cache memory if it looks like a remember prompt
      if (
        trimmed.toLowerCase().includes('remember') ||
        trimmed.toLowerCase().includes('save memory') ||
        trimmed.toLowerCase().includes('favorite')
      ) {
        const cleaned = trimmed.replace(/remember (that )?/i, '').trim();
        if (cleaned) {
          const stored = localStorage.getItem('local_memories');
          const mems: string[] = stored ? JSON.parse(stored) : [];
          if (!mems.includes(cleaned)) {
            mems.unshift(cleaned);
            localStorage.setItem('local_memories', JSON.stringify(mems));
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Check connection to backend server.';
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: `Error contacting agent: ${msg}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <div className="chat-container">
      {/* Messages viewport */}
      <div className="chat-messages no-scrollbar" role="log" aria-live="polite" aria-label="Conversation history">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isUser ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderLeft: isUser ? '1px solid var(--border)' : '3px solid var(--accent)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isUser ? (
                    <User size={14} color="var(--accent)" />
                  ) : (
                    <Brain size={14} color="var(--accent)" />
                  )}
                  <span
                    className="mono"
                    style={{
                      fontWeight: 600,
                      fontSize: '12px',
                      color: isUser ? 'var(--accent)' : 'var(--text-secondary)'
                    }}
                  >
                    {isUser ? userName : 'RecallFlow AI'}
                  </span>
                </div>
                <span className="mono text-muted" style={{ fontSize: '11px' }}>
                  {msg.timestamp}
                </span>
              </div>

              <div
                style={{
                  whiteSpace: 'pre-wrap',
                  fontSize: '13.5px',
                  lineHeight: 1.55,
                  color: 'var(--text-primary)',
                  paddingLeft: '20px'
                }}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {loading && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderLeft: '3px solid var(--accent)'
            }}
          >
            <Sparkles size={16} color="var(--accent)" className="animate-pulse" />
            <span className="mono text-muted" style={{ fontSize: '13px' }}>
              RecallFlow is thinking...
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input container */}
      <div className="chat-input-container">
        {/* Quick prompt suggestions */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            marginBottom: '10px',
            flexWrap: 'wrap'
          }}
          aria-label="Suggested prompts"
        >
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              className="suggestion-btn"
              onClick={() => handleSend(s.query)}
              disabled={loading}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Text Input Wrapper */}
        <div className="chat-input-wrapper">
          <label htmlFor="chat-input-box" className="sr-only">Ask RecallFlow a question</label>
          <textarea
            id="chat-input-box"
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask RecallFlow anything, or tell it to schedule a task/event..."
            disabled={loading}
            rows={1}
          />
          <button
            type="button"
            className="primary"
            onClick={() => handleSend(input)}
            disabled={loading || !input.trim()}
            style={{ height: '42px', padding: '0 16px' }}
            aria-label="Send message"
          >
            <Send size={15} />
            <span style={{ marginLeft: '4px' }}>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
