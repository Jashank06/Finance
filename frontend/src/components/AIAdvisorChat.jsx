import { useState, useRef, useEffect } from 'react';
import api from '../utils/api';
import { TrendingUp, HandCoins, CalendarClock, PieChart, CreditCard } from 'lucide-react';
import aiAvatarImg from '../assets/Finance_Chatbot.png';
import './AIAdvisorChat.css';

const QUICK_CHIPS = [
    { label: '💰 Net worth?', msg: 'What is my current net worth and how is it distributed?' },
    { label: '📊 Budget status?', msg: 'How am I doing against my budget this month? Any concerns?' },
    { label: '💡 Investment advice?', msg: 'Based on my current portfolio, what investment improvements would you suggest?' },
    { label: '📉 Spending analysis?', msg: 'Analyze my spending patterns and tell me where I can save more money.' },
    { label: '🎯 Financial health?', msg: 'Give me an overall assessment of my financial health with specific actionable tips.' }
];

// Simple markdown-ish text renderer
function renderMessage(text) {
    const lines = text.split('\n');
    return lines.map((line, i) => {
        // Bold text **text**
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Bullet points
        if (line.trim().startsWith('* ') || line.trim().startsWith('• ') || line.trim().startsWith('- ')) {
            return <li key={i} style={{ marginBottom: 3 }} dangerouslySetInnerHTML={{ __html: line.replace(/^[\*•\-]\s*/, '') }} />;
        }
        // Headers
        if (line.trim().startsWith('###')) {
            return <div key={i} style={{ fontWeight: 700, color: '#a78bfa', marginTop: 8, marginBottom: 4 }}>{line.replace(/^#+\s*/, '')}</div>;
        }
        if (line.trim() === '') return <br key={i} />;
        return <span key={i} dangerouslySetInnerHTML={{ __html: line + ' ' }} />;
    });
}

export default function AIAdvisorChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'ai',
            text: 'Namaste! 🙏 I\'m **Palbamb AI**, your personal financial advisor.\n\nI have access to your real financial data — bank balances, investments, expenses & more. Ask me anything about your finances!'
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const [introStage, setIntroStage] = useState('entering'); // 'entering', 'expanding', 'greeting', 'collapsing', 'morphing', 'done'
    const [hasSeenIntro, setHasSeenIntro] = useState(true);
    const [showPostIntroTooltip, setShowPostIntroTooltip] = useState(false);

    useEffect(() => {
        const handleTrigger = (e) => {
            const tipText = e.detail;
            if (!tipText) return;

            setIsOpen(true);
            // Small delay to ensure panel opens before sending
            setTimeout(() => {
                sendMessage(`Explain this financial tip in detail and tell me how I can apply it to my situation: "${tipText}"`);
            }, 500);
        };

        window.addEventListener('triggerAiChat', handleTrigger);
        return () => window.removeEventListener('triggerAiChat', handleTrigger);
    }, [messages, isTyping]); // dependencies needed to ensure sendMessage works with latest state

    useEffect(() => {
        // Check session storage so intro only plays once per session
        const seen = sessionStorage.getItem('aiSeenIntro');
        if (seen) {
            setIntroStage('done');
            setHasSeenIntro(true);
        } else {
            setHasSeenIntro(false);

            // Animation sequence orchestrator
            // 1. Enter (avatar flies to center) -> 1.0s wait
            const t1 = setTimeout(() => setIntroStage('expanding'), 800);

            // 2. Expanding (nodes shoot out) -> 1.8s wait
            const t2 = setTimeout(() => setIntroStage('greeting'), 1800);

            // 3. Greeting (text visible for 2.5s) -> then pull nodes back in
            const t3 = setTimeout(() => setIntroStage('collapsing'), 4500);

            // 4. Collapsing finishes, then morph to corner
            const t4 = setTimeout(() => setIntroStage('morphing'), 5300);

            // 5. Morph (shoots to corner, 1.2s transition) -> then done
            const t5 = setTimeout(() => {
                setIntroStage('done');
                setShowPostIntroTooltip(true);
                sessionStorage.setItem('aiSeenIntro', 'true');
            }, 6400);

            // 6. Post-landing showcase (elevated + tooltip for 5s)
            const t6 = setTimeout(() => {
                setShowPostIntroTooltip(false);
            }, 11400);

            return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); clearTimeout(t6); };
        }
    }, []);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    const sendMessage = async (text) => {
        const msg = (text || inputText).trim();
        if (!msg || isTyping) return;

        setInputText('');
        setMessages(prev => [...prev, { role: 'user', text: msg }]);
        setIsTyping(true);

        const history = [];
        const recentMsgs = messages.slice(-10);
        for (let i = 0; i < recentMsgs.length - 1; i += 2) {
            if (recentMsgs[i]?.role === 'ai' && recentMsgs[i + 1]?.role === 'user') {
                history.push({ ai: recentMsgs[i].text, user: recentMsgs[i + 1].text });
            }
        }

        try {
            const res = await api.post('/ai/chat', {
                message: msg,
                history,
                currentPath: window.location.pathname
            });
            const reply = res.data.reply || 'Sorry, I could not process that. Please try again.';
            setMessages(prev => [...prev, { role: 'ai', text: reply }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'ai',
                text: '⚠️ I\'m having trouble connecting right now. Please check your connection and try again.'
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Cinematic Intro Overlay */}
            {!hasSeenIntro && introStage !== 'done' && (
                <div className={`ai-intro-overlay ${introStage === 'morphing' ? 'morphing' : ''}`}>
                    <div className={`ai-intro-avatar-container ${introStage === 'morphing' ? 'morphing' : ''}`}>
                        <div className={`ai-orb-premium-large ${(introStage === 'expanding' || introStage === 'greeting' || introStage === 'collapsing') ? 'active' : ''}`}>
                            <img src={aiAvatarImg} alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        </div>
                        <div className="ai-intro-ring" />
                        <div className="ai-intro-ring" />
                    </div>

                    {/* Orbit System (Unscaled Container) */}
                    <div className="orbit-system">
                        <div className={`orbit-node node-0 ${introStage === 'expanding' || introStage === 'greeting' ? 'show' : ''}`}>
                            <div className="orbit-icon"><TrendingUp size={24} strokeWidth={2} /></div>
                            <span className="orbit-label">Investments</span>
                        </div>
                        <div className={`orbit-node node-1 ${introStage === 'expanding' || introStage === 'greeting' ? 'show' : ''}`}>
                            <div className="orbit-icon"><HandCoins size={24} strokeWidth={2} /></div>
                            <span className="orbit-label">Loans & Udhar</span>
                        </div>
                        <div className={`orbit-node node-2 ${introStage === 'expanding' || introStage === 'greeting' ? 'show' : ''}`}>
                            <div className="orbit-icon"><CalendarClock size={24} strokeWidth={2} /></div>
                            <span className="orbit-label">Bill Dates</span>
                        </div>
                        <div className={`orbit-node node-3 ${introStage === 'expanding' || introStage === 'greeting' ? 'show' : ''}`}>
                            <div className="orbit-icon"><CreditCard size={24} strokeWidth={2} /></div>
                            <span className="orbit-label">Spending</span>
                        </div>
                        <div className={`orbit-node node-4 ${introStage === 'expanding' || introStage === 'greeting' ? 'show' : ''}`}>
                            <div className="orbit-icon"><PieChart size={24} strokeWidth={2} /></div>
                            <span className="orbit-label">Net Worth</span>
                        </div>
                    </div>

                    <div className={`ai-intro-text-container ${introStage === 'morphing' || introStage === 'collapsing' ? 'morphing' : ''}`}>
                        {(introStage === 'greeting' || introStage === 'collapsing' || introStage === 'expanding') && (
                            <>
                                <h2 className="ai-intro-title">Hello. I am your Financial Advisor.</h2>
                                <p className="ai-intro-subtitle">Syncing your financial ecosystem...</p>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Chat Panel */}
            {isOpen && (
                <div className="ai-panel">
                    {/* Header */}
                    <div className="ai-panel-header">
                        <div className="ai-header-left">
                            <div className="ai-avatar">
                                <div className="ai-orb-premium-small">
                                    <img src={aiAvatarImg} alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                                </div>
                            </div>
                            <div>
                                <div className="ai-header-name">Palbamb Financial Advisor</div>
                                <div className="ai-header-status">
                                    <span className="ai-status-dot" />
                                    Online
                                </div>
                            </div>
                        </div>
                        <button className="ai-close-btn" onClick={() => setIsOpen(false)}>✕</button>
                    </div>

                    {/* Messages */}
                    <div className="ai-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`ai-msg ${msg.role}`}>
                                <div className="ai-msg-avatar">
                                    {msg.role === 'ai' ? (
                                        <div className="ai-orb-premium-chat">
                                            <img src={aiAvatarImg} alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                                        </div>
                                    ) : '👤'}
                                </div>
                                <div className="ai-msg-bubble">
                                    {renderMessage(msg.text)}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="ai-msg ai">
                                <div className="ai-msg-avatar">
                                    <div className="ai-orb-premium-chat">
                                        <img src={aiAvatarImg} alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                                    </div>
                                </div>
                                <div className="ai-typing">
                                    <span /><span /><span />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick chips */}
                    <div className="ai-chips">
                        {QUICK_CHIPS.map((chip, i) => (
                            <button key={i} className="ai-chip" onClick={() => sendMessage(chip.msg)} disabled={isTyping}>
                                {chip.label}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="ai-input-area">
                        <textarea
                            className="ai-input"
                            placeholder="Ask about your finances... (Enter to send)"
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                            disabled={isTyping}
                        />
                        <button className="ai-send-btn" onClick={() => sendMessage()} disabled={isTyping || !inputText.trim()}>
                            {isTyping ? '⏳' : '➤'}
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Bubble */}
            <div className="ai-bubble-container">
                {showPostIntroTooltip && !isOpen && (
                    <div className="ai-post-intro-tooltip">
                        <span className="typewriter-text">AI Financial Advisor</span>
                    </div>
                )}
                <button className={`ai-bubble ${isOpen ? 'open' : ''} ${introStage === 'done' && !hasSeenIntro ? 'landed' : ''} ${showPostIntroTooltip ? 'elevated' : ''}`} onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? '✕' : (
                        <div className="ai-orb-premium-fab">
                            <img src={aiAvatarImg} alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        </div>
                    )}
                    {!isOpen && <span className="ai-badge" />}
                </button>
            </div>
        </>
    );
}
