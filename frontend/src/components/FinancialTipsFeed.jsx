import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiZap, FiActivity } from 'react-icons/fi';
import api from '../utils/api';
import './FinancialTipsFeed.css';

// Master list of super premium financial tips
const MASTER_TIPS = [
    "Aim to save at least **20% of your monthly income** before spending on lifestyle.",
    "Pay off high-interest debt first. Credit card interest destroys wealth faster than inflation.",
    "Track your net worth monthly. What gets measured gets managed.",
    "Build an emergency fund covering **3-6 months** of living expenses.",
    "Invest consistently. Missing the 10 best days in the market halves your long-term returns.",
    "Automate your investments. Pay your future self first on payday.",
    "Reinvest your dividends to take full advantage of compounding interest.",
    "Avoid lifestyle creep. If your salary increases, increase your investments, not just your expenses.",
    "Before making a large purchase, wait 48 hours to avoid impulse buying.",
    "Review your subscriptions monthly. Cancel unused passive leaks in your wealth.",
    "Don't try to time the market. Time **in** the market beats timing the market.",
    "Diversify your portfolio. Don't put all your eggs in one basket.",
    "Buy assets that put money in your pocket, limit liabilities that take money out.",
    "Understand the difference between good debt (leverage) and bad debt.",
    "Max out your tax-advantaged retirement accounts (PPF, NPS) every year.",
    "Your health is your greatest wealth. Invest in good medical insurance.",
    "Never invest in something you don't fully understand.",
    "The 50/30/20 rule: 50% Needs, 30% Wants, 20% Savings/Investing.",
    "Negotiate your bills. Internet, insurance, and medical bills often have wiggle room.",
    "Buy term insurance to protect your family, don't mix insurance with investment."
];

export default function FinancialTipsFeed() {
    const [feedItems, setFeedItems] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const fetchNewsAndMix = async () => {
            // Pick 3 static tips
            const daySeed = Math.floor(Date.now() / 86400000);
            const shuffled = [...MASTER_TIPS].sort((a, b) => {
                const hashA = (a.length * daySeed) % 100;
                const hashB = (b.length * daySeed) % 100;
                return hashA - hashB;
            });
            const selectedTips = shuffled.slice(0, 3).map(text => ({ type: 'tip', text }));

            // Fetch live news
            let newsItems = [];
            try {
                const res = await api.get('/market-news/live');
                if (res.data && res.data.success && res.data.data.length > 0) {
                    // Take top 3 news items
                    newsItems = res.data.data.slice(0, 3).map(news => ({
                        type: 'news',
                        text: `${news.title}`,
                        link: news.link
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch market news for feed", error);
                // Fallback: just use more tips if news fails
                newsItems = shuffled.slice(3, 6).map(text => ({ type: 'tip', text }));
            }

            // Interleave tips and news: Tip, News, Tip, News...
            const combined = [];
            const maxLength = Math.max(selectedTips.length, newsItems.length);
            for (let i = 0; i < maxLength; i++) {
                if (selectedTips[i]) combined.push(selectedTips[i]);
                if (newsItems[i]) combined.push(newsItems[i]);
            }

            // Format bold text
            const formattedFeed = combined.map(item => {
                const parts = item.text.split(/(\*\*.*?\*\*)/g);
                const formattedElement = parts.map((part, i) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={i}>{part.slice(2, -2)}</strong>;
                    }
                    return part;
                });
                return { ...item, formattedText: formattedElement };
            });

            setFeedItems(formattedFeed);
        };

        fetchNewsAndMix();
    }, []);

    useEffect(() => {
        if (feedItems.length === 0) return;

        // Rotate feed every 6 seconds
        const interval = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % feedItems.length);
        }, 6000);

        return () => clearInterval(interval);
    }, [feedItems]);

    if (feedItems.length === 0) return null;

    const handleAskAI = (text) => {
        // Dispatch custom event to trigger AI Advisor
        const event = new CustomEvent('triggerAiChat', { detail: text });
        window.dispatchEvent(event);
    };

    const currentItem = feedItems[activeIndex];
    const activeType = currentItem?.type; // Define activeType based on currentItem.type

    return (
        <div className="tips-feed-container">
            <div className="tips-feed-icon">
                <FiZap />
            </div>
            <div className="tips-feed-title">
                {activeType === 'news' ? 'LIVE NEWS' : 'MARKET TIPS'}
            </div>

            <div className="tips-slide-container">
                {feedItems.map((item, idx) => (
                    <div key={idx} className={`tip-slide ${idx === activeIndex ? 'active' : ''}`}>
                        <div className="tip-content-wrapper">
                            <div className="tip-main-content">
                                {item.type === 'news' && <span className="live-badge">🔴 LIVE</span>}
                                <div className="tip-text">
                                    <span className="tip-text-content">{item.formattedText}</span>
                                </div>
                            </div>
                            <button
                                className="ask-ai-btn"
                                onClick={() => handleAskAI(item.text)}
                                title="Ask AI Advisor for more details"
                            >
                                <FiZap className="btn-icon" />
                                <span>Ask AI Advisor</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="tips-progress">
                {feedItems.map((_, idx) => (
                    <div
                        key={idx}
                        className={`tip-dot ${idx === activeIndex ? 'active' : ''}`}
                    />
                ))}
            </div>
        </div>
    );
}
