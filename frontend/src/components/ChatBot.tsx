import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, Send, Bot, User, Zap } from 'lucide-react';
import { getBotResponse } from '../utils/chatbotEngine';
import { Task, TaskStatus } from '../types';
import api from '../api/client';
import './ChatBot.css';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

// Quick action chips that users can click
const QUICK_ACTIONS = [
    { label: '📊 My Tasks', query: 'my tasks' },
    { label: '⚠️ Overdue', query: 'overdue tasks' },
    { label: '📅 Deadlines', query: 'upcoming deadlines' },
    { label: '🔴 Priority', query: 'high priority' },
    { label: '🎯 What Next?', query: 'what should I do' },
    { label: '💡 Tips', query: 'productivity tips' },
];

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [hasNotification, setHasNotification] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const hasFetchedRef = useRef(false);

    // Fetch tasks from API
    const fetchTasks = useCallback(async () => {
        try {
            const res = await api.get('/tasks/');
            setTasks(res.data);
            return res.data as Task[];
        } catch (err) {
            console.error('ChatBot: failed to fetch tasks', err);
            return tasks;
        }
    }, []);

    // Generate welcome message with live data
    const generateWelcome = useCallback(async () => {
        const liveTasks = await fetchTasks();
        const pending = liveTasks.filter((t: Task) => t.status !== TaskStatus.DONE).length;
        const overdue = liveTasks.filter((t: Task) =>
            t.due_date && t.status !== TaskStatus.DONE && new Date(t.due_date) < new Date()
        ).length;
        const highPri = liveTasks.filter((t: Task) =>
            t.priority === 'high' && t.status !== TaskStatus.DONE
        ).length;

        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

        let welcomeText = `${greeting}! 👋 I'm your **TaskFlow AI Assistant**.\n\n`;

        if (liveTasks.length > 0) {
            welcomeText += `📋 You have **${liveTasks.length} tasks** — **${pending} pending**.\n`;
            if (overdue > 0) welcomeText += `⚠️ **${overdue} task${overdue > 1 ? 's are' : ' is'} overdue!**\n`;
            if (highPri > 0) welcomeText += `🔴 **${highPri} high-priority** task${highPri > 1 ? 's' : ''} need${highPri === 1 ? 's' : ''} attention.\n`;
            welcomeText += '\nTap a quick action below or ask me anything!';
        } else {
            welcomeText += "You don't have any tasks yet. Create some from the **Tasks** page and I'll help you manage them!";
        }

        // Show notification badge if there's something urgent
        if (overdue > 0 || highPri > 2) {
            setHasNotification(true);
        }

        setMessages([{
            id: 0,
            text: welcomeText,
            sender: 'bot',
            timestamp: new Date()
        }]);
    }, [fetchTasks]);

    // Initialize on first open
    useEffect(() => {
        if (isOpen && !hasFetchedRef.current) {
            hasFetchedRef.current = true;
            generateWelcome();
        }
    }, [isOpen, generateWelcome]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Focus input
    useEffect(() => {
        if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
    }, [isOpen]);

    const sendMessage = async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || isTyping) return;

        // Add user message
        setMessages(prev => [...prev, {
            id: Date.now(),
            text: trimmed,
            sender: 'user',
            timestamp: new Date()
        }]);
        setInput('');
        setIsTyping(true);

        // Refresh tasks for latest data
        const latestTasks = await fetchTasks();

        // Get response
        const { text: responseText, delay } = getBotResponse(trimmed, latestTasks);
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: responseText,
                sender: 'bot',
                timestamp: new Date()
            }]);
            setIsTyping(false);
        }, delay);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    const handleOpen = () => {
        setIsOpen(true);
        setHasNotification(false);
    };

    // Bold + line break parser
    const formatText = (text: string) => {
        return text.split('\n').map((line, i) => (
            <span key={i}>
                {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={j}>{part.slice(2, -2)}</strong>;
                    }
                    return part;
                })}
                {i < text.split('\n').length - 1 && <br />}
            </span>
        ));
    };

    return (
        <>
            {/* Chat Window */}
            <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
                {/* Header */}
                <div className="chatbot-header">
                    <div className="chatbot-header-info">
                        <div className="chatbot-header-avatar">
                            <Bot size={18} />
                        </div>
                        <div>
                            <h4>TaskFlow AI</h4>
                            <span className="chatbot-status">
                                <span className="status-dot"></span> Online • {tasks.length} tasks loaded
                            </span>
                        </div>
                    </div>
                    <button className="chatbot-close" onClick={() => setIsOpen(false)}>
                        <X size={18} />
                    </button>
                </div>

                {/* Messages */}
                <div className="chatbot-messages">
                    {messages.map(msg => (
                        <div key={msg.id} className={`chatbot-msg ${msg.sender}`}>
                            <div className="chatbot-msg-avatar">
                                {msg.sender === 'bot' ? <Bot size={14} /> : <User size={14} />}
                            </div>
                            <div className="chatbot-msg-bubble">
                                <div className="chatbot-msg-text">{formatText(msg.text)}</div>
                                <span className="chatbot-msg-time">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="chatbot-msg bot">
                            <div className="chatbot-msg-avatar"><Bot size={14} /></div>
                            <div className="chatbot-msg-bubble typing">
                                <span className="typing-dot"></span>
                                <span className="typing-dot"></span>
                                <span className="typing-dot"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                <div className="chatbot-quick-actions">
                    {QUICK_ACTIONS.map((action, i) => (
                        <button
                            key={i}
                            className="quick-action-chip"
                            onClick={() => sendMessage(action.query)}
                            disabled={isTyping}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>

                {/* Input */}
                <div className="chatbot-input-area">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about your tasks..."
                        className="chatbot-input"
                        disabled={isTyping}
                    />
                    <button
                        className="chatbot-send"
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || isTyping}
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>

            {/* Floating Button */}
            <button
                className={`chatbot-fab ${isOpen ? 'hidden' : ''}`}
                onClick={handleOpen}
                title="Chat with AI Assistant"
            >
                <MessageSquare size={22} />
                <span className="chatbot-fab-pulse"></span>
                {hasNotification && <span className="chatbot-fab-badge">!</span>}
            </button>
        </>
    );
};

export default ChatBot;
