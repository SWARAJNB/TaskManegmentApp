import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
    ClipboardList, CheckCircle2, Clock, AlertCircle,
    ArrowRight, Target, Zap, Award, Rocket, TrendingUp, Calendar
} from 'lucide-react';
import Loading from '../components/Loading';
import './Home.css';

interface Stats {
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
    high_priority_tasks: number;
    completion_rate: number;
}

const Home = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        api.get('/tasks/analytics/')
            .then(res => setStats(res.data))
            .catch(err => console.error(err));
    }, []);

    if (!stats) return <Loading />;

    const firstName = user?.full_name?.split(' ')[0] || 'User';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    // Productivity tips
    const tips = [
        { icon: <Target size={20} />, title: 'Set Clear Goals', desc: 'Break tasks into smaller, actionable items for better focus.' },
        { icon: <Zap size={20} />, title: 'Stay Consistent', desc: 'Complete at least one task daily to build momentum.' },
        { icon: <Award size={20} />, title: 'Celebrate Wins', desc: 'Acknowledge completed tasks to stay motivated.' },
        { icon: <Rocket size={20} />, title: 'Prioritize Wisely', desc: 'Tackle high-priority items first for maximum impact.' },
    ];

    return (
        <div className="home-container fade-in">
            {/* Hero Section */}
            <div className="home-hero">
                <div className="hero-content">
                    <p className="hero-greeting">{greeting},</p>
                    <h1 className="hero-name">{firstName}! 👋</h1>
                    <p className="hero-subtitle">
                        Here's your productivity snapshot. Let's make today count.
                    </p>
                    <div className="hero-actions">
                        <Link to="/tasks" className="hero-btn primary">
                            <ClipboardList size={18} /> Go to Tasks <ArrowRight size={16} />
                        </Link>
                        <Link to="/dashboard" className="hero-btn secondary">
                            <TrendingUp size={18} /> View Dashboard
                        </Link>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="hero-circle">
                        <div className="hero-avatar">
                            {user?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="hero-ring" />
                    </div>
                </div>
            </div>

            {/* Profile Card */}
            <div className="home-profile-card">
                <div className="profile-avatar-lg">
                    {user?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="profile-info">
                    <h2 className="profile-name">{user?.full_name || 'User'}</h2>
                    <p className="profile-email">{user?.email}</p>
                    <span className="profile-badge">
                        <Calendar size={14} /> Joined TaskFlow
                    </span>
                </div>
                <div className="profile-completion">
                    <div className="completion-ring-wrapper">
                        <svg viewBox="0 0 100 100" className="completion-svg">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="8" />
                            <circle
                                cx="50" cy="50" r="42" fill="none"
                                stroke="var(--primary)"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${stats.completion_rate * 2.64} ${264 - stats.completion_rate * 2.64}`}
                                transform="rotate(-90 50 50)"
                                style={{ transition: 'stroke-dasharray 1s ease' }}
                            />
                        </svg>
                        <div className="completion-text">
                            <span className="completion-number">{Math.round(stats.completion_rate)}%</span>
                            <span className="completion-label">Done</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="home-stats-row">
                <div className="home-stat-card">
                    <div className="stat-icon" style={{ background: 'var(--primary)' }}>
                        <ClipboardList size={20} color="white" />
                    </div>
                    <div className="stat-data">
                        <span className="stat-number">{stats.total_tasks}</span>
                        <span className="stat-text">Total Tasks</span>
                    </div>
                </div>
                <div className="home-stat-card">
                    <div className="stat-icon" style={{ background: 'var(--success)' }}>
                        <CheckCircle2 size={20} color="white" />
                    </div>
                    <div className="stat-data">
                        <span className="stat-number">{stats.completed_tasks}</span>
                        <span className="stat-text">Completed</span>
                    </div>
                </div>
                <div className="home-stat-card">
                    <div className="stat-icon" style={{ background: 'var(--warning)' }}>
                        <Clock size={20} color="white" />
                    </div>
                    <div className="stat-data">
                        <span className="stat-number">{stats.pending_tasks}</span>
                        <span className="stat-text">Pending</span>
                    </div>
                </div>
                <div className="home-stat-card">
                    <div className="stat-icon" style={{ background: 'var(--danger)' }}>
                        <AlertCircle size={20} color="white" />
                    </div>
                    <div className="stat-data">
                        <span className="stat-number">{stats.high_priority_tasks}</span>
                        <span className="stat-text">High Priority</span>
                    </div>
                </div>
            </div>

            {/* Productivity Tips */}
            <div className="home-section">
                <h3 className="section-heading">
                    <Zap size={20} /> Productivity Tips
                </h3>
                <div className="tips-grid">
                    {tips.map((tip, i) => (
                        <div key={i} className="tip-card" style={{ animationDelay: `${i * 0.1}s` }}>
                            <div className="tip-icon">{tip.icon}</div>
                            <h4 className="tip-title">{tip.title}</h4>
                            <p className="tip-desc">{tip.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Links */}
            <div className="home-section">
                <h3 className="section-heading">
                    <Rocket size={20} /> Quick Actions
                </h3>
                <div className="quick-links-grid">
                    <Link to="/tasks" className="quick-link-card">
                        <ClipboardList size={24} />
                        <span>Manage Tasks</span>
                        <ArrowRight size={16} className="ql-arrow" />
                    </Link>
                    <Link to="/dashboard" className="quick-link-card">
                        <TrendingUp size={24} />
                        <span>View Analytics</span>
                        <ArrowRight size={16} className="ql-arrow" />
                    </Link>
                    <Link to="/profile" className="quick-link-card">
                        <Award size={24} />
                        <span>Edit Profile</span>
                        <ArrowRight size={16} className="ql-arrow" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;
