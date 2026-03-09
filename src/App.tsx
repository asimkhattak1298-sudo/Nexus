import { useState, useRef, useEffect, FormEvent } from 'react';

// Use environment variable for API key
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

const MODELS = [
  { id: 'arcee-ai/trinity-large-preview:free', name: 'Arcee Trinity Large' },
  { id: 'openrouter/free', name: 'OpenRouter Free' },
  { id: 'nousresearch/hermes-3-llama-3.1-405b:free', name: 'Hermes 3 · 405B' },
  { id: 'liquid/lfm-2.5-1.2b-thinking:free', name: 'Liquid LFM Thinking' },
  { id: 'nvidia/llama-nemotron-embed-vl-1b-v2:free', name: 'Nvidia Nemotron VL' },
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/* ============ LOGO ============ */
function NexusLogo({ size = 80 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}
    >
      {/* Outer ring */}
      <circle cx="60" cy="60" r="56" stroke="white" strokeWidth="1.5" opacity="0.3" />
      <circle cx="60" cy="60" r="50" stroke="white" strokeWidth="0.8" opacity="0.15" />
      {/* Hex shape */}
      <polygon
        points="60,14 98,35 98,77 60,98 22,77 22,35"
        stroke="white"
        strokeWidth="2"
        fill="none"
        opacity="0.9"
      />
      <polygon
        points="60,24 90,40 90,72 60,88 30,72 30,40"
        stroke="white"
        strokeWidth="1"
        fill="none"
        opacity="0.3"
      />
      {/* Inner N */}
      <path
        d="M42 75 L42 45 L60 65 L60 45"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M66 75 L66 45"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      {/* Dots at vertices */}
      <circle cx="60" cy="14" r="2.5" fill="white" opacity="0.8" />
      <circle cx="98" cy="35" r="2.5" fill="white" opacity="0.8" />
      <circle cx="98" cy="77" r="2.5" fill="white" opacity="0.8" />
      <circle cx="60" cy="98" r="2.5" fill="white" opacity="0.8" />
      <circle cx="22" cy="77" r="2.5" fill="white" opacity="0.8" />
      <circle cx="22" cy="35" r="2.5" fill="white" opacity="0.8" />
      {/* Orbital dot */}
      <circle cx="60" cy="4" r="2" fill="white" opacity="0.6">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 60 60"
          to="360 60 60"
          dur="8s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}

/* ============ SPACESHIP LOADER ============ */
function SpaceshipLoader() {
  return (
    <div className="loader-container">
      <div className="loader">
        <span>
          <span></span><span></span><span></span><span></span>
        </span>
        <div className="base">
          <span></span>
          <div className="face"></div>
        </div>
      </div>
      <div className="longfazers">
        <span></span><span></span><span></span><span></span>
      </div>
    </div>
  );
}

/* ============ SEND BUTTON SVG ============ */
function SendIcon() {
  return (
    <svg
      className="send-btn-svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
      />
    </svg>
  );
}

/* ============ WELCOME PAGE ============ */
function WelcomePage({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06]" style={{
        background: 'radial-gradient(circle, white 0%, transparent 70%)'
      }} />

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl" style={{ animation: 'fadeInUp 1s ease-out' }}>
        {/* Logo */}
        <div style={{ animation: 'float 4s ease-in-out infinite' }}>
          <NexusLogo size={100} />
        </div>

        {/* Name */}
        <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-[0.15em]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          NEXUS<span className="text-gray-500">AI</span>
        </h1>

        {/* Tagline */}
        <p className="mt-3 text-gray-500 text-sm md:text-base tracking-[0.3em] uppercase" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Beyond Intelligence
        </p>

        {/* Divider */}
        <div className="mt-8 w-32 h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent" />

        {/* Description */}
        <p className="mt-8 text-gray-400 text-base md:text-lg leading-relaxed max-w-lg">
          Welcome to <span className="text-white font-semibold">NEXUS AI</span> — your gateway to the next generation of artificial intelligence. Powered by cutting-edge language models, NEXUS delivers instant, intelligent conversations across multiple AI architectures. Switch between five elite models on-the-fly, experience lightning-fast responses, and explore the frontier of human-AI interaction — all within a sleek, futuristic interface designed for the minds of tomorrow.
        </p>

        <p className="mt-4 text-gray-600 text-sm">
          Multi-model • Real-time • Free • Unlimited
        </p>

        {/* Get Started Button */}
        <div className="mt-10">
          <button className="gradient-button" onClick={onStart}>
            <span className="gradient-text">GET STARTED</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============ CHAT PAGE ============ */
function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    // Check if API key is configured
    if (!API_KEY) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Error: OpenRouter API key is not configured. Please add VITE_OPENROUTER_API_KEY to your .env file.' 
      }]);
      return;
    }

    const userMessage: Message = { role: 'user', content: trimmed };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();

      if (data.choices && data.choices.length > 0) {
        const aiContent = data.choices[0].message?.content || 'No response received.';
        setMessages(prev => [...prev, { role: 'assistant', content: aiContent }]);
      } else if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error.message || 'Something went wrong.'}` }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'No response received from the model.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Network error. Please check your connection and try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* HEADER */}
      <header className="flex-shrink-0 border-b border-[#1a1a1a] bg-[#050505] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Logo + Name */}
          <div className="flex items-center gap-3">
            <NexusLogo size={32} />
            <h1 className="text-lg font-bold tracking-[0.1em] hidden sm:block" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              NEXUS<span className="text-gray-500">AI</span>
            </h1>
          </div>

          {/* Model selector + Clear */}
          <div className="flex items-center gap-3">
            <select
              className="model-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {MODELS.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <button
              onClick={clearChat}
              className="text-gray-500 hover:text-white transition-colors text-xs border border-[#333] rounded-lg px-3 py-2 hover:border-[#666]"
              title="Clear chat"
            >
              Clear
            </button>
          </div>
        </div>
      </header>

      {/* MESSAGES AREA */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
              <div style={{ animation: 'float 4s ease-in-out infinite' }}>
                <NexusLogo size={60} />
              </div>
              <p className="mt-6 text-gray-500 text-lg" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                How can I help you?
              </p>
              <p className="mt-2 text-gray-700 text-sm">
                Select a model above and start chatting
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 text-sm md:text-[15px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'message-user text-gray-200 rounded-br-md'
                    : 'message-ai text-gray-300 rounded-bl-md'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#222]">
                    <NexusLogo size={16} />
                    <span className="text-[11px] text-gray-600 uppercase tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                      Nexus AI
                    </span>
                  </div>
                )}
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="mb-4 flex justify-start">
              <div className="max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 message-ai rounded-bl-md">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#222]">
                  <NexusLogo size={16} />
                  <span className="text-[11px] text-gray-600 uppercase tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    Nexus AI
                  </span>
                </div>
                <SpaceshipLoader />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* INPUT AREA */}
      <footer className="flex-shrink-0 border-t border-[#1a1a1a] bg-[#050505] px-4 py-4">
        <form
          className="max-w-4xl mx-auto relative flex items-center"
          onSubmit={sendMessage}
        >
          {/* Input wrapper with send button inside */}
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            {/* Send button positioned inside input on the right */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <div className="send-btn-wrapper">
                <button
                  type="submit"
                  className={`send-btn ${isLoading ? 'is-loading' : ''}`}
                  disabled={isLoading || !input.trim()}
                  style={{ opacity: !input.trim() && !isLoading ? 0.4 : 1 }}
                >
                  <SendIcon />
                </button>
              </div>
            </div>
          </div>
        </form>
        <p className="text-center text-[10px] text-gray-700 mt-2">
          NEXUS AI can make mistakes. Verify important information.
        </p>
      </footer>
    </div>
  );
}

/* ============ APP ============ */
export default function App() {
  const [started, setStarted] = useState(false);

  if (!started) {
    return <WelcomePage onStart={() => setStarted(true)} />;
  }

  return <ChatPage />;
        }
          
