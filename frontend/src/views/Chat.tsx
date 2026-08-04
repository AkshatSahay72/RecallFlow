import React, { useState, useRef, useEffect } from 'react';
import { chatWithAgent } from '../services/chat';
import type { ChatMessage } from '../types';

export default function Chat() {
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
    "What are my tasks?",
    "Schedule a meeting tomorrow at 3 PM",
    "Remember that my flight leaves at 8 PM on Thursday",
    "What do you remember about my preferences?"
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
                {msg.sender === 'user' ? 'user@recallflow:~$' : 'system@recallflow:~$'}
              </span>
              <span className="mono text-muted" style={{ fontSize: '9px' }}>{msg.timestamp}</span>
            </div>
            <div style={{ whiteSpace: 'pre-wrap', paddingLeft: '12px', fontSize: '13px' }}>{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="mono text-muted" style={{ fontWeight: 600, fontSize: '11px' }}>system@recallflow:~$</span>
            <div className="mono text-muted" style={{ paddingLeft: '12px', fontSize: '13px' }}>Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input container */}
      <div className="chat-input-container">
        {/* Suggested Actions as commands */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '10px', alignItems: 'center' }}>
          <span className="text-muted mono" style={{ fontSize: '10px' }}>Quick Commands:</span>
          {suggestions.map((s, i) => (
            <button
              key={i}
              className="link mono"
              style={{ fontSize: '11px', background: 'none', border: 'none', padding: 0 }}
              onClick={() => handleSend(s)}
              disabled={loading}
            >
              /{s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-')}
            </button>
          ))}
        </div>

        {/* Input Wrapper */}
        <div className="chat-input-wrapper">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Send a command or query to RecallFlow..."
            disabled={loading}
          />
          <button
            className="primary"
            onClick={() => handleSend(input)}
            disabled={loading || !input.trim()}
            style={{ height: '38px' }}
          >
            Execute
          </button>
        </div>
      </div>
    </div>
  );
}
