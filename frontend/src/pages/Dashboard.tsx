import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import {
    ClipboardList, CheckCircle2, Clock, AlertCircle, TrendingUp,
    Calendar, ArrowRight, Target, Zap, Flame, Brain, Lightbulb,
    Sparkles, MessageSquare, Activity
} from 'lucide-react';
import Loading from '../components/Loading';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import TaskForm from '../components/TaskForm';
import { Task } from '../types';
import { useWebSocket } from '../context/WebSocketContext';

const STATUS_COLORS = ['#94a3b8', '#6366f1', '#22c55e'];
const PRIORITY_COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

/* ── AI Insight Generator ── */
const generateInsights = (stats: any) => {
    const insights: { icon: any; title: string; desc: string; type: string }[] = [];
    const rate = stats.completion_rate || 0;
    const total = stats.total_tasks || 0;
    const high = stats.high_priority_tasks || 0;
    const pending = stats.pending_tasks || 0;
    const streak = stats.current_streak || 0;
    const avgTime = stats.avg_completion_time || 0;

    // Productivity insight
    if (rate >= 75) {
        insights.push({
            icon: <Sparkles size={18} />,
            title: 'Outstanding Productivity',
            desc: `You've completed ${Math.round(rate)}% of your tasks — keep this momentum going!`,
            type: 'success'
        });
    } else if (rate >= 40) {
        insights.push({
            icon: <TrendingUp size={18} />,
            title: 'Good Progress',
            desc: `${Math.round(rate)}% completion rate. Try batching similar tasks to boost efficiency.`,
            type: 'info'
        });
    } else {
        insights.push({
            icon: <Lightbulb size={18} />,
            title: 'Focus Recommendation',
            desc: total > 0
                ? `Only ${Math.round(rate)}% tasks completed. Consider using the 2-minute rule for quick wins.`
                : 'Create your first task to start tracking productivity!',
            type: 'warning'
        });
    }

    // High priority alert
    if (high > 0) {
        insights.push({
            icon: <AlertCircle size={18} />,
            title: `${high} High Priority Task${high > 1 ? 's' : ''} Pending`,
            desc: 'AI suggests tackling high-priority items first using the Eisenhower Matrix approach.',
            type: 'danger'
        });
    }

    // Streak insight
    if (streak >= 3) {
        insights.push({
            icon: <Flame size={18} />,
            title: `${streak}-Day Activity Streak!`,
            desc: 'Consistency is the key to success. You\'re building a powerful habit.',
            type: 'success'
        });
    } else if (streak === 0 && total > 0) {
        insights.push({
            icon: <Activity size={18} />,
            title: 'Start Your Streak',
            desc: 'No activity today yet. Complete a quick task to begin a new streak!',
            type: 'info'
        });
    }

    // Workload balance
    if (pending > 5) {
        insights.push({
            icon: <Brain size={18} />,
            title: 'Workload Alert',
            desc: `You have ${pending} pending tasks. Consider delegating or breaking them into sub-tasks.`,
            type: 'warning'
        });
    }

    // Time efficiency
    if (avgTime > 0) {
        insights.push({
            icon: <Zap size={18} />,
            title: 'Time Efficiency',
            desc: avgTime <= 2
                ? `Avg ${avgTime}h per task — you're working efficiently!`
                : `Avg ${avgTime}h per task. Try using the Pomodoro technique to reduce time.`,
            type: avgTime <= 2 ? 'success' : 'info'
        });
    }

    return insights.slice(0, 4);
};

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [recentTasks, setRecentTasks] = useState<Task[]>([]);
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
    const [period, setPeriod] = useState('week');
    const [chartMetric, setChartMetric] = useState<'tasks' | 'hours'>('tasks');
    const { lastMessage } = useWebSocket();

    const fetchData = async (selectedPeriod?: string) => {
        try {
            const p = selectedPeriod || period;
            const [statsRes, tasksRes] = await Promise.all([
                api.get(`/tasks/analytics/?period=${p}`),
                api.get('/tasks/?limit=5')
            ]);
            setStats(statsRes.data);
            setRecentTasks(tasksRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { fetchData(); }, [lastMessage]);
    useEffect(() => { fetchData(); }, []);

    const handlePeriodChange = (newPeriod: string) => {
        setPeriod(newPeriod);
        fetchData(newPeriod);
    };

    if (!stats) return <Loading />;

    const trendData = stats?.daily_activity?.map((day: any) => ({
        name: day.date,
        tasks: day.count,
        hours: day.hours || 0
    })) || [];

    const chartTitle = period === 'day' ? 'Today\'s Activity' : period === 'month' ? 'Monthly Activity' : 'Weekly Productivity';

    const handleExport = async () => {
        try {
            const response = await api.get('/tasks/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'tasks_export.csv');
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to export tasks", error);
        }
    };

    const firstName = user?.full_name?.split(' ')[0] || 'User';
    const completionRate = stats.completion_rate ? Math.round(stats.completion_rate) : 0;
    const statusData = stats.status_breakdown || [];
    const priorityData = stats.priority_breakdown || [];
    const avgTime = stats.avg_completion_time || 0;
    const streak = stats.current_streak || 0;
    const insights = generateInsights(stats);

    return (
        <div className="dashboard-container fade-in">
            {/* Header */}
            <header className="dashboard-header-modern">
                <div>
                    <h1 className="dashboard-title-modern">Welcome back, {firstName}! 👋</h1>
                    <p className="dashboard-subtitle-modern">Here's what's happening with your projects today.</p>
                </div>
                <div className="header-actions">
                    <span className="date-badge"><Calendar size={14} /> {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    <button onClick={handleExport} className="export-btn">Export CSV</button>
                    <button onClick={() => setIsTaskFormOpen(true)} className="create-task-btn">+ New Task</button>
                </div>
            </header>

            {/* Stat Cards */}
            <div className="stats-grid-modern">
                <StatCardModern icon={<ClipboardList size={22} color="white" />} color="var(--primary)" title="Total Tasks" value={stats.total_tasks} />
                <StatCardModern icon={<CheckCircle2 size={22} color="white" />} color="var(--success)" title="Completed" value={stats.completed_tasks} />
                <StatCardModern icon={<Clock size={22} color="white" />} color="var(--warning)" title="Pending" value={stats.pending_tasks} />
                <StatCardModern icon={<AlertCircle size={22} color="white" />} color="var(--danger)" title="High Priority" value={stats.high_priority_tasks} trend="Requires Attention" trendUp={false} trendColor="var(--danger)" />
            </div>

            {/* Performance Metrics */}
            <div className="performance-metrics-row">
                <div className="perf-metric-card">
                    <div className="perf-metric-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                        <Target size={20} color="white" />
                    </div>
                    <div className="perf-metric-info">
                        <span className="perf-metric-value">{completionRate}%</span>
                        <span className="perf-metric-label">Completion Rate</span>
                    </div>
                    <div className="perf-metric-bar-track">
                        <div className="perf-metric-bar-fill" style={{ width: `${completionRate}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}></div>
                    </div>
                </div>
                <div className="perf-metric-card">
                    <div className="perf-metric-icon" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
                        <Zap size={20} color="white" />
                    </div>
                    <div className="perf-metric-info">
                        <span className="perf-metric-value">{avgTime}h</span>
                        <span className="perf-metric-label">Avg. Time / Task</span>
                    </div>
                </div>
                <div className="perf-metric-card">
                    <div className="perf-metric-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
                        <Flame size={20} color="white" />
                    </div>
                    <div className="perf-metric-info">
                        <span className="perf-metric-value">{streak} day{streak !== 1 ? 's' : ''}</span>
                        <span className="perf-metric-label">Activity Streak 🔥</span>
                    </div>
                </div>
            </div>

            {/* ✨ AI Insights Section */}
            <div className="ai-insights-section">
                <div className="ai-insights-header">
                    <div className="ai-insights-title">
                        <div className="ai-badge">
                            <MessageSquare size={18} />
                            <span>AI</span>
                        </div>
                        <h3>Smart Insights</h3>
                    </div>
                    <p className="ai-insights-subtitle">AI-powered recommendations based on your productivity data</p>
                </div>
                <div className="ai-insights-grid">
                    {insights.map((insight, i) => (
                        <div key={i} className={`ai-insight-card ${insight.type}`} style={{ animationDelay: `${i * 0.1}s` }}>
                            <div className={`ai-insight-icon ${insight.type}`}>
                                {insight.icon}
                            </div>
                            <div className="ai-insight-content">
                                <h4>{insight.title}</h4>
                                <p>{insight.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Activity Chart + Recent Tasks */}
            <div className="dashboard-content-grid">
                <div className="chart-section-modern">
                    <div className="section-header">
                        <h3>{chartTitle}</h3>
                        <div className="chart-controls">
                            <div className="metric-toggle">
                                <button className={`metric-btn ${chartMetric === 'tasks' ? 'active' : ''}`} onClick={() => setChartMetric('tasks')}>Tasks</button>
                                <button className={`metric-btn ${chartMetric === 'hours' ? 'active' : ''}`} onClick={() => setChartMetric('hours')}>Hours</button>
                            </div>
                            <select className="chart-select" value={period} onChange={(e) => handlePeriodChange(e.target.value)}>
                                <option value="day">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                            </select>
                        </div>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} dy={10} interval={period === 'month' ? 4 : period === 'day' ? 3 : 0} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} allowDecimals={chartMetric === 'hours'} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-lg)', backgroundColor: 'var(--surface)' }} cursor={{ stroke: chartMetric === 'tasks' ? 'var(--primary)' : '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }} formatter={(value: number) => [chartMetric === 'tasks' ? `${value} tasks` : `${value} hrs`, chartMetric === 'tasks' ? 'Tasks Created' : 'Time Logged']} />
                                <Area type="monotone" dataKey={chartMetric} stroke={chartMetric === 'tasks' ? 'var(--primary)' : '#10b981'} strokeWidth={3} fillOpacity={1} fill={chartMetric === 'tasks' ? 'url(#colorTasks)' : 'url(#colorHours)'} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="recent-tasks-section">
                    <div className="section-header">
                        <h3>Recent Tasks</h3>
                        <Link to="/tasks" className="view-all-link">View All <ArrowRight size={14} /></Link>
                    </div>
                    <div className="recent-tasks-list">
                        {recentTasks.length === 0 ? (
                            <div className="empty-state-small">No recent tasks found.</div>
                        ) : (
                            recentTasks.map(task => (
                                <div key={task.id} className="recent-task-item">
                                    <div className={`status-indicator ${task.status}`}></div>
                                    <div className="task-info">
                                        <h4>{task.title}</h4>
                                        <span className="task-meta-text">
                                            {new Date(task.created_at).toLocaleDateString()} • {task.priority}
                                            {task.time_spent ? ` • ${task.time_spent}h` : ''}
                                        </span>
                                    </div>
                                    <Link to={`/tasks/${task.id}`} className="task-arrow"><ArrowRight size={16} /></Link>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Analytics Charts Row */}
            <div className="analytics-grid">
                {/* Status Distribution Donut */}
                <div className="analytics-card">
                    <div className="section-header"><h3>Task Status Distribution</h3></div>
                    <div className="donut-chart-wrapper">
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={statusData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={4} dataKey="value" nameKey="label" stroke="none">
                                    {statusData.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-lg)', backgroundColor: 'var(--surface)', color: 'var(--text)' }} formatter={(value: number, name: string) => [`${value} tasks`, name]} />
                                <Legend verticalAlign="bottom" iconType="circle" iconSize={8} formatter={(value: string) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{value}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="donut-center-label">
                            <span className="donut-center-value">{stats.total_tasks}</span>
                            <span className="donut-center-text">Total</span>
                        </div>
                    </div>
                </div>

                {/* Priority Breakdown */}
                <div className="analytics-card">
                    <div className="section-header"><h3>Priority Breakdown</h3></div>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barCategoryGap="30%">
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} allowDecimals={false} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-lg)', backgroundColor: 'var(--surface)', color: 'var(--text)' }} formatter={(value: number) => [`${value} tasks`, 'Count']} cursor={{ fill: 'var(--surface-hover)', radius: 4 } as any} />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={50}>
                                {priorityData.map((_: any, index: number) => (
                                    <Cell key={`bar-${index}`} fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <TaskForm isOpen={isTaskFormOpen} onClose={() => setIsTaskFormOpen(false)} onTaskSaved={fetchData} />
        </div>
    );
};

const StatCardModern = ({ icon, color, title, value, trend, trendUp, trendColor }: any) => (
    <div className="stat-card-modern">
        <div className="stat-top">
            <div className="stat-icon-box" style={{ backgroundColor: color }}>{icon}</div>
            {trend && (
                <div className={`trend-badge ${trendUp ? 'up' : 'down'}`} style={trendColor ? { color: trendColor, backgroundColor: 'rgba(239, 68, 68, 0.1)' } : {}}>
                    {trendUp ? <TrendingUp size={14} /> : null} {trend}
                </div>
            )}
        </div>
        <div className="stat-content">
            <div className="stat-value">{value}</div>
            <div className="stat-label">{title}</div>
        </div>
    </div>
);

export default Dashboard;
