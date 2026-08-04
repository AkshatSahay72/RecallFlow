import React, { useState, useRef, useEffect } from 'react';
import { chatWithAgent } from '../services/chat';
import type { ChatMessage } from '../types';

interface ChatProps {
  userEmail: string | null;
}

export default function Chat({ userEmail }: ChatProps) {
  // Derive a display name from email: "akshat@gmail.com" → "Akshat"
  const userName = userEmail
    ? userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1)
    : 'You';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'agent',
      text: 'Hello. I am RecallFlow, your personal productivity assistant. How can I help you manage your schedule, tasks, or remember details today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    { label: 'My tasks', query: 'What are my tasks?' },
    { label: 'Schedule meeting', query: 'Schedule a meeting tomorrow at 3 PM' },
    { label: 'Save a memory', query: 'Remember that my flight leaves at 8 PM on Thursday' },
    { label: 'My preferences', query: 'What do you remember about my preferences?' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatWithAgent(textToSend);
      
      const agentMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'agent',
        text: res.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, agentMsg]);

      // If the message looked like a "remember/save memory" request, let's cache it locally
      // so the Memory view can show it (as fallback for lack of direct memories GET endpoint)
      if (
        textToSend.toLowerCase().includes('remember') || 
        textToSend.toLowerCase().includes('save memory') ||
        textToSend.toLowerCase().includes('favorite')
      ) {
        const cleaned = textToSend.replace(/remember (that )?/i, '').trim();
        const stored = localStorage.getItem('local_memories');
        const memories = stored ? JSON.parse(stored) : [];
        if (cleaned && !memories.includes(cleaned)) {
          memories.unshift(cleaned);
          localStorage.setItem('local_memories', JSON.stringify(memories));
        }
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'agent',
        text: `Error contacting agent: ${err.message || 'Check connection to backend server.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <div className="chat-container">
      {/* Messages viewport */}
      <div className="chat-messages no-scrollbar">
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="mono" style={{ fontWeight: 600, fontSize: '11px', color: msg.sender === 'user' ? 'var(--accent)' : 'var(--text-secondary)' }}>
                {msg.sender === 'user' ? userName : 'RecallFlow'}
              </span>
              <span className="mono text-muted" style={{ fontSize: '9px' }}>{msg.timestamp}</span>
            </div>
            <div style={{ whiteSpace: 'pre-wrap', paddingLeft: '12px', fontSize: '13px' }}>{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="mono text-muted" style={{ fontWeight: 600, fontSize: '11px' }}>RecallFlow</span>
            <div className="mono text-muted" style={{ paddingLeft: '12px', fontSize: '13px' }}>Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input container */}
      <div className="chat-input-container">
        {/* Quick command buttons */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSend(s.query)}
              disabled={loading}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                borderRadius: '3px',
                cursor: 'pointer',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Input Wrapper */}
        <div className="chat-input-wrapper">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask RecallFlow anything..."
            disabled={loading}
          />
          <button
            className="primary"
            onClick={() => handleSend(input)}
            disabled={loading || !input.trim()}
            style={{ height: '38px' }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
