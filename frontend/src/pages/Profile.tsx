import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
    User, Mail, Lock, Save, ClipboardList, CheckCircle2, Target,
    Calendar, Clock, Flame, Shield, Bell, Zap, TrendingUp,
    Award, BarChart3, Activity, Camera, Loader2
} from 'lucide-react';
import './Profile.css';

const Profile = () => {
    const { user, refreshUser } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [perfStats, setPerfStats] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    useEffect(() => {
        if (user) {
            setFullName(user.full_name);
            setEmail(user.email);
        }
    }, [user]);

    useEffect(() => {
        const fetchPerformance = async () => {
            try {
                const res = await api.get('/users/performance');
                setPerfStats(res.data);
            } catch (err) {
                console.error('Failed to fetch performance data', err);
            }
        };
        fetchPerformance();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const updateData: any = { full_name: fullName, email };
            if (password) updateData.password = password;
            await api.put('/users/me/', updateData);
            setMessage('Profile updated successfully!');
            setPassword('');
            refreshUser();
        } catch (err) {
            setError('Failed to update profile');
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('Only JPEG, PNG, GIF, and WEBP images are allowed');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be smaller than 5MB');
            return;
        }

        setUploading(true);
        setError('');
        setMessage('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            await api.post('/users/me/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            await refreshUser();
            setMessage('Profile picture updated!');
        } catch (err) {
            setError('Failed to upload image');
        } finally {
            setUploading(false);
            // Reset input so re-selecting same file still triggers onChange
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const initials = user?.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    const profileImageUrl = user?.profile_image
        ? `${API_BASE}${user.profile_image}`
        : null;

    const completionRate = perfStats?.completion_rate ? Math.round(perfStats.completion_rate) : 0;
    const totalTasks = perfStats?.total_tasks ?? 0;
    const completedTasks = perfStats?.completed_tasks ?? 0;
    const streak = perfStats?.current_streak ?? 0;
    const avgTime = perfStats?.avg_completion_time ?? 0;
    const pendingTasks = totalTasks - completedTasks;

    // Performance level
    const getLevel = () => {
        if (totalTasks >= 50) return { label: 'Expert', color: '#f59e0b', icon: <Award size={16} /> };
        if (totalTasks >= 20) return { label: 'Advanced', color: '#8b5cf6', icon: <TrendingUp size={16} /> };
        if (totalTasks >= 5) return { label: 'Intermediate', color: '#6366f1', icon: <Activity size={16} /> };
        return { label: 'Beginner', color: '#22c55e', icon: <Zap size={16} /> };
    };
    const level = getLevel();

    return (
        <div className="profile-page fade-in">
            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/gif,image/webp"
                style={{ display: 'none' }}
            />

            {/* ===== Banner ===== */}
            <div className="profile-banner">
                <div className="profile-banner-gradient"></div>
                <div className="profile-banner-content">
                    <div className="profile-avatar-large" onClick={handleAvatarClick} title="Click to change profile picture">
                        {uploading ? (
                            <Loader2 size={28} className="avatar-spinner" />
                        ) : profileImageUrl ? (
                            <img src={profileImageUrl} alt="Profile" className="avatar-image" />
                        ) : (
                            <span>{initials}</span>
                        )}
                        <div className="profile-avatar-ring"></div>
                        <div className="avatar-overlay">
                            <Camera size={18} />
                        </div>
                    </div>
                    <div className="profile-banner-info">
                        <h1>{user?.full_name || 'User'}</h1>
                        <p className="profile-banner-email">{user?.email}</p>
                        <div className="profile-banner-badges">
                            <span className="profile-badge">
                                <Calendar size={13} /> Member since {new Date().getFullYear()}
                            </span>
                            <span className="profile-badge level" style={{ borderColor: level.color, color: level.color }}>
                                {level.icon} {level.label}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== Stats Grid ===== */}
            <div className="profile-stats-grid">
                <div className="profile-stat-card">
                    <div className="profile-stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
                        <ClipboardList size={20} color="white" />
                    </div>
                    <div className="profile-stat-data">
                        <span className="profile-stat-number">{totalTasks}</span>
                        <span className="profile-stat-text">Total Tasks</span>
                    </div>
                </div>
                <div className="profile-stat-card">
                    <div className="profile-stat-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #4ade80)' }}>
                        <CheckCircle2 size={20} color="white" />
                    </div>
                    <div className="profile-stat-data">
                        <span className="profile-stat-number">{completedTasks}</span>
                        <span className="profile-stat-text">Completed</span>
                    </div>
                </div>
                <div className="profile-stat-card">
                    <div className="profile-stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
                        <Clock size={20} color="white" />
                    </div>
                    <div className="profile-stat-data">
                        <span className="profile-stat-number">{pendingTasks}</span>
                        <span className="profile-stat-text">Pending</span>
                    </div>
                </div>
                <div className="profile-stat-card">
                    <div className="profile-stat-icon" style={{ background: 'linear-gradient(135deg, #ec4899, #f472b6)' }}>
                        <Flame size={20} color="white" />
                    </div>
                    <div className="profile-stat-data">
                        <span className="profile-stat-number">{streak}</span>
                        <span className="profile-stat-text">Day Streak 🔥</span>
                    </div>
                </div>
            </div>

            {/* ===== Two Column Layout ===== */}
            <div className="profile-content-grid">
                {/* Left Column – Performance Overview */}
                <div className="profile-left-col">
                    {/* Productivity Card */}
                    <div className="profile-card">
                        <div className="profile-card-header">
                            <h3><BarChart3 size={18} /> Productivity Overview</h3>
                        </div>
                        <div className="productivity-metrics">
                            <div className="productivity-ring-section">
                                <div className="ring-container">
                                    <svg viewBox="0 0 120 120" className="ring-svg">
                                        <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="10" />
                                        <circle
                                            cx="60" cy="60" r="50" fill="none"
                                            stroke="url(#ringGrad)" strokeWidth="10"
                                            strokeLinecap="round"
                                            strokeDasharray={`${completionRate * 3.14} ${314 - completionRate * 3.14}`}
                                            transform="rotate(-90 60 60)"
                                            className="ring-progress"
                                        />
                                        <defs>
                                            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#6366f1" />
                                                <stop offset="100%" stopColor="#ec4899" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="ring-center">
                                        <span className="ring-value">{completionRate}%</span>
                                        <span className="ring-label">Done</span>
                                    </div>
                                </div>
                            </div>
                            <div className="productivity-details">
                                <div className="prod-detail-item">
                                    <span className="prod-detail-label">Avg. Time per Task</span>
                                    <span className="prod-detail-value">{avgTime}h</span>
                                </div>
                                <div className="prod-detail-item">
                                    <span className="prod-detail-label">Tasks Completed</span>
                                    <span className="prod-detail-value">{completedTasks} / {totalTasks}</span>
                                </div>
                                <div className="prod-detail-item">
                                    <span className="prod-detail-label">Current Streak</span>
                                    <span className="prod-detail-value">{streak} day{streak !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="prod-detail-item">
                                    <span className="prod-detail-label">Level</span>
                                    <span className="prod-detail-value" style={{ color: level.color }}>{level.label}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="profile-card">
                        <div className="profile-card-header">
                            <h3><Zap size={18} /> Quick Actions</h3>
                        </div>
                        <div className="quick-actions-grid">
                            <a href="/tasks" className="quick-action-btn">
                                <ClipboardList size={20} />
                                <span>View Tasks</span>
                            </a>
                            <a href="/dashboard" className="quick-action-btn">
                                <BarChart3 size={20} />
                                <span>Dashboard</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Right Column – Edit Profile */}
                <div className="profile-right-col">
                    <div className="profile-card">
                        <div className="profile-card-header">
                            <h3><User size={18} /> Account Settings</h3>
                        </div>

                        {message && <div className="profile-alert success"><CheckCircle2 size={16} /> {message}</div>}
                        {error && <div className="profile-alert error">{error}</div>}

                        <form onSubmit={handleSubmit} className="profile-form">
                            {/* Personal Info Section */}
                            <div className="form-section-label">Personal Information</div>
                            <div className="profile-form-group">
                                <label><User size={15} /> Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Your full name"
                                />
                            </div>
                            <div className="profile-form-group">
                                <label><Mail size={15} /> Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Your email address"
                                />
                            </div>

                            {/* Security Section */}
                            <div className="form-divider"></div>
                            <div className="form-section-label">Security</div>
                            <div className="profile-form-group">
                                <label><Lock size={15} /> New Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter new password"
                                />
                                <span className="form-hint">Leave blank to keep your current password</span>
                            </div>
                            <div className="security-info-card">
                                <Shield size={20} />
                                <div>
                                    <h4>Account Security</h4>
                                    <p>Your account is protected with password authentication. We recommend using a strong, unique password.</p>
                                </div>
                            </div>

                            <button type="submit" className="profile-save-btn">
                                <Save size={16} /> Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;


