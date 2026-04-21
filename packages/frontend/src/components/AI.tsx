import { useRef, useEffect, useState } from 'react';
import { Send, Bot, User, StopCircle, Plus, Trash2, MessageSquare } from 'lucide-react';
import { useAIChat, useAIConversations, useSaveConversation, useDeleteConversation } from '../hooks/useAI';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Skeleton } from './ui/Skeleton';

function MessageBubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  const isUser = role === 'user';
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '1rem',
    }}>
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, marginRight: '0.625rem', marginTop: 2,
        }}>
          <Bot size={17} style={{ color: '#fff' }} />
        </div>
      )}
      <div style={{
        maxWidth: '72%',
        padding: '0.75rem 1rem',
        borderRadius: isUser ? 'var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg)' : 'var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)',
        background: isUser ? 'var(--accent-primary)' : 'var(--bg-secondary)',
        color: isUser ? '#fff' : 'var(--text-primary)',
        fontSize: '0.9rem',
        lineHeight: 1.55,
        boxShadow: 'var(--shadow-sm)',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {content}
      </div>
      {isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, marginLeft: '0.625rem', marginTop: 2,
        }}>
          <User size={17} style={{ color: 'var(--text-secondary)' }} />
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0', marginBottom: '0.5rem' }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Bot size={17} style={{ color: '#fff' }} />
      </div>
      <div style={{ display: 'flex', gap: '0.3rem', padding: '0.5rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)',
            animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

export default function AI() {
  const { messages, isStreaming, error, sendMessage, cancelStream, clearMessages, loadConversation } = useAIChat();
  const { data: conversations, isLoading: convsLoading } = useAIConversations();
  const saveConversation = useSaveConversation();
  const deleteConversation = useDeleteConversation();
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  async function handleSend() {
    if (!input.trim() || isStreaming) return;
    const msg = input.trim();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    await sendMessage(msg);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleTextareaInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
  }

  async function handleSave() {
    if (messages.length === 0) return;
    const title = messages[0]?.content.slice(0, 50);
    await saveConversation.mutateAsync({ title, messages });
  }

  const SUGGESTED = [
    'What should I focus on today?',
    'Help me prioritize my tasks',
    'Give me tips to stay productive',
    'Review my goals and suggest next steps',
  ];

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px - 3rem)', gap: '1rem', maxWidth: 1100, margin: '0 auto' }}>
      {/* Conversations sidebar */}
      {sidebarOpen && (
        <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>History</span>
            <Button variant="ghost" size="sm" leftIcon={<Plus size={13} />} onClick={clearMessages}>New</Button>
          </div>
          {convsLoading ? <Skeleton lines={4} /> : (
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {conversations?.map((conv) => (
                <div key={conv.id} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <button
                    onClick={() => loadConversation(conv)}
                    style={{
                      flex: 1, textAlign: 'left', padding: '0.5rem 0.625rem',
                      borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                      background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.8125rem',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      transition: 'var(--transition)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    {conv.title ?? conv.messages[0]?.content.slice(0, 30) ?? 'Untitled'}
                  </button>
                  <button
                    onClick={() => deleteConversation.mutate(conv.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '0.25rem', borderRadius: 4, flexShrink: 0 }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-coral)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {(!conversations || conversations.length === 0) && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', textAlign: 'center', padding: '1rem 0' }}>No saved chats</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Chat header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
          >
            <MessageSquare size={18} />
          </button>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', background: 'var(--accent-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bot size={18} style={{ color: '#fff' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>AI Coach</h1>
            <p style={{ fontSize: '0.75rem', color: isStreaming ? 'var(--accent-green)' : 'var(--text-muted)', margin: 0 }}>
              {isStreaming ? 'Thinking...' : 'Claude-powered productivity assistant'}
            </p>
          </div>
          <div style={{ flex: 1 }} />
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleSave} isLoading={saveConversation.isPending}>
              Save Chat
            </Button>
          )}
        </div>

        {/* Messages */}
        <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
            {messages.length === 0 && !isStreaming ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1.5rem' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', background: 'color-mix(in srgb, var(--accent-primary) 15%, transparent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Bot size={28} style={{ color: 'var(--accent-primary)' }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
                    How can I help you today?
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                    Ask me about productivity, task management, or anything else.
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', width: '100%', maxWidth: 480 }}>
                  {SUGGESTED.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                      style={{
                        padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)',
                        color: 'var(--text-secondary)', fontSize: '0.8125rem', cursor: 'pointer',
                        textAlign: 'left', transition: 'var(--transition)', lineHeight: 1.4,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <MessageBubble key={i} role={msg.role} content={msg.content} />
                ))}
                {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && <TypingIndicator />}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* Input area */}
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            {error && (
              <div style={{ marginBottom: '0.75rem', padding: '0.625rem 0.875rem', background: 'color-mix(in srgb, var(--accent-coral) 10%, transparent)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--accent-coral)' }}>
                Error: {error}
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder="Message AI Coach... (Enter to send, Shift+Enter for new line)"
                rows={1}
                style={{
                  flex: 1, resize: 'none', border: '1.5px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)', padding: '0.625rem 0.875rem',
                  fontSize: '0.9rem', color: 'var(--text-primary)', background: 'var(--bg-primary)',
                  outline: 'none', lineHeight: 1.5, fontFamily: 'inherit',
                  transition: 'border-color 150ms',
                  overflowY: 'hidden',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent-primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
              />
              {isStreaming ? (
                <Button variant="danger" onClick={cancelStream} title="Stop">
                  <StopCircle size={18} />
                </Button>
              ) : (
                <Button variant="primary" onClick={handleSend} disabled={!input.trim()} title="Send">
                  <Send size={18} />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
