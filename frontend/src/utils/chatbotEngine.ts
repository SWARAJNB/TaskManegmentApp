/**
 * chatbotEngine.ts
 *
 * Smart AI response engine that uses REAL user task data to generate
 * dynamic, context-aware responses. Combines a project knowledge base
 * with live task analysis for personalized human-like interactions.
 *
 * TECHNOLOGY: Pure TypeScript — runs entirely on the client side.
 * Accepts live task data from the ChatBot component which fetches it via API.
 */

import { Task, TaskStatus, TaskPriority } from '../types';

export interface BotResponse {
    text: string;
    delay: number;
}

interface KnowledgeEntry {
    keywords: string[];
    response: string | ((tasks: Task[]) => string);
}

// ── Helpers ──
const greet = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
};

const timeAgo = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
};

const daysUntil = (dateStr: string): number => {
    return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
};

// ── Dynamic Task Analysis Functions ──

const getTaskSummary = (tasks: Task[]): string => {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === TaskStatus.DONE).length;
    const inProgress = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
    const todo = tasks.filter(t => t.status === TaskStatus.TODO).length;
    const highPri = tasks.filter(t => t.priority === TaskPriority.HIGH && t.status !== TaskStatus.DONE).length;
    const rate = total > 0 ? Math.round((done / total) * 100) : 0;

    if (total === 0) {
        return "📋 You don't have any tasks yet! Head to the **Tasks** page and click **+ New Task** to create your first one. I'll be here to help you track everything!";
    }

    return `📊 **Your Task Summary:**\n• **${total}** total tasks\n• ✅ **${done}** completed (${rate}% done)\n• 🔄 **${inProgress}** in progress\n• 📝 **${todo}** still to do\n• 🔴 **${highPri}** high-priority pending\n\n${rate >= 80 ? "🎉 Amazing work! You're crushing it!" : rate >= 50 ? "💪 Good progress! Keep the momentum going!" : "🚀 Let's pick up the pace — you've got this!"}`;
};

const getOverdueTasks = (tasks: Task[]): string => {
    const overdue = tasks.filter(t => {
        if (!t.due_date || t.status === TaskStatus.DONE) return false;
        return new Date(t.due_date) < new Date();
    });

    if (overdue.length === 0) {
        return "✅ Great news! You have **no overdue tasks**. Everything is on track! Keep it up! 🎯";
    }

    const list = overdue.slice(0, 5).map(t =>
        `• **${t.title}** — was due ${timeAgo(t.due_date!)} (${t.priority} priority)`
    ).join('\n');

    return `⚠️ **${overdue.length} Overdue Task${overdue.length > 1 ? 's' : ''}:**\n${list}\n\n💡 I'd recommend tackling these first! Start with the highest priority ones.`;
};

const getUpcomingDeadlines = (tasks: Task[]): string => {
    const upcoming = tasks
        .filter(t => t.due_date && t.status !== TaskStatus.DONE && daysUntil(t.due_date) >= 0 && daysUntil(t.due_date) <= 7)
        .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());

    if (upcoming.length === 0) {
        return "📅 No deadlines coming up in the next 7 days. You're in the clear! Perfect time to plan ahead. 🧘";
    }

    const list = upcoming.slice(0, 5).map(t => {
        const d = daysUntil(t.due_date!);
        const urgency = d === 0 ? '🔴 TODAY' : d === 1 ? '🟠 Tomorrow' : `🟡 ${d} days`;
        return `• **${t.title}** — ${urgency}`;
    }).join('\n');

    return `📅 **Upcoming Deadlines (next 7 days):**\n${list}\n\n⏰ Stay ahead — maybe knock one out right now?`;
};

const getHighPriorityTasks = (tasks: Task[]): string => {
    const high = tasks.filter(t => t.priority === TaskPriority.HIGH && t.status !== TaskStatus.DONE);

    if (high.length === 0) {
        return "🎉 No pending high-priority tasks! All critical work is done. Time to focus on medium and low priority items. 👏";
    }

    const list = high.slice(0, 5).map(t => {
        const status = t.status === TaskStatus.IN_PROGRESS ? '🔄 In Progress' : '📝 Todo';
        return `• **${t.title}** — ${status}`;
    }).join('\n');

    return `🔴 **${high.length} High-Priority Task${high.length > 1 ? 's' : ''} Pending:**\n${list}\n\n🎯 Focus on these first for maximum impact!`;
};

const getInProgressTasks = (tasks: Task[]): string => {
    const active = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS);

    if (active.length === 0) {
        return "🤔 You don't have any tasks **in progress** right now. Pick a task and start working on it! I recommend starting with high-priority items.";
    }

    const list = active.slice(0, 5).map(t => {
        const time = t.time_spent ? ` (${t.time_spent}h logged)` : '';
        return `• **${t.title}**${time} — ${t.priority} priority`;
    }).join('\n');

    return `🔄 **Currently In Progress (${active.length}):**\n${list}\n\n💪 Keep going! Focus on finishing one before starting another.`;
};

const getRecentActivity = (tasks: Task[]): string => {
    const sorted = [...tasks].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const recent = sorted.slice(0, 5);

    if (recent.length === 0) {
        return "📭 No recent activity yet. Create your first task to get started!";
    }

    const list = recent.map(t => {
        const icon = t.status === TaskStatus.DONE ? '✅' : t.status === TaskStatus.IN_PROGRESS ? '🔄' : '📝';
        return `• ${icon} **${t.title}** — created ${timeAgo(t.created_at)}`;
    }).join('\n');

    return `📋 **Recent Activity:**\n${list}`;
};

const getProductivityTip = (tasks: Task[]): string => {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === TaskStatus.DONE).length;
    const rate = total > 0 ? (done / total) * 100 : 0;
    const highPending = tasks.filter(t => t.priority === TaskPriority.HIGH && t.status !== TaskStatus.DONE).length;
    const overdue = tasks.filter(t => t.due_date && t.status !== TaskStatus.DONE && new Date(t.due_date) < new Date()).length;

    const tips: string[] = [];

    if (overdue > 0) tips.push(`⚠️ You have **${overdue} overdue** task${overdue > 1 ? 's' : ''}. Try the **2-minute rule** — if a task takes less than 2 minutes, do it now!`);
    if (highPending > 3) tips.push(`🔴 **${highPending} high-priority tasks** are piling up. Use the **Eisenhower Matrix**: Urgent+Important → Do now, Important → Schedule, Urgent → Delegate, Neither → Drop.`);
    if (rate < 30 && total > 5) tips.push("📉 Your completion rate is low. Try **breaking big tasks into smaller ones** — each small win releases dopamine and builds momentum!");
    if (rate >= 80) tips.push("🏆 Your completion rate is over 80%! You're on fire! Consider setting **stretch goals** to push yourself further.");

    const inProgress = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
    if (inProgress > 3) tips.push(`🔄 You have **${inProgress} tasks in progress** simultaneously. Studies show focusing on **1–3 tasks at a time** leads to better results. Consider finishing some before starting new ones.`);

    if (tips.length === 0) {
        tips.push("💡 **Pro Tip:** Try the **Pomodoro Technique** — work for 25 minutes, take a 5-minute break. After 4 cycles, take a longer break. It's proven to boost focus!");
    }

    return `🧠 **Smart Insights:**\n\n${tips.join('\n\n')}`;
};

const getWhatShouldIDo = (tasks: Task[]): string => {
    // Priority: overdue → high priority → in progress → any todo
    const overdue = tasks.filter(t => t.due_date && t.status !== TaskStatus.DONE && new Date(t.due_date) < new Date())
        .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());
    if (overdue.length > 0) {
        return `🚨 **Do this right now:** **${overdue[0].title}**\nIt's overdue! Clear this one first and you'll feel so much better. You've got this! 💪`;
    }

    const highTodo = tasks.filter(t => t.priority === TaskPriority.HIGH && t.status === TaskStatus.TODO);
    if (highTodo.length > 0) {
        return `🎯 **I'd start with:** **${highTodo[0].title}**\nIt's high-priority and hasn't been started yet. Tackling it now will have the biggest impact!`;
    }

    const inProgress = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS);
    if (inProgress.length > 0) {
        return `🔄 **Finish what you started:** **${inProgress[0].title}**\nIt's already in progress — focus on completing it before starting anything new. One thing at a time! 🧠`;
    }

    const todo = tasks.filter(t => t.status === TaskStatus.TODO);
    if (todo.length > 0) {
        return `📝 **Pick this one up:** **${todo[0].title}**\nIt's waiting for you! Start small, build momentum. 🚀`;
    }

    return "🎉 **All caught up!** You have no pending tasks. Enjoy the free time or plan your next set of goals! 🏖️";
};

// ── Knowledge Base (static + dynamic) ──
const knowledgeBase: KnowledgeEntry[] = [
    {
        keywords: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good evening', 'good afternoon'],
        response: (tasks) => {
            const total = tasks.length;
            const pending = tasks.filter(t => t.status !== TaskStatus.DONE).length;
            const greeting = greet();
            return `${greeting}! 👋 I'm your TaskFlow AI Assistant.\n\n${total > 0 ? `You have **${total} tasks** (${pending} pending). ` : ''}I can tell you about your tasks, deadlines, priorities, and give productivity tips. What would you like to know?`;
        }
    },
    {
        keywords: ['my tasks', 'task summary', 'how many tasks', 'task count', 'summary', 'overview', 'show tasks', 'status'],
        response: (tasks) => getTaskSummary(tasks)
    },
    {
        keywords: ['overdue', 'late', 'missed', 'past due', 'expired'],
        response: (tasks) => getOverdueTasks(tasks)
    },
    {
        keywords: ['deadline', 'due', 'upcoming', 'due soon', 'due date', 'schedule', 'calendar'],
        response: (tasks) => getUpcomingDeadlines(tasks)
    },
    {
        keywords: ['high priority', 'important', 'urgent', 'critical', 'priority'],
        response: (tasks) => getHighPriorityTasks(tasks)
    },
    {
        keywords: ['in progress', 'working on', 'active', 'current', 'doing'],
        response: (tasks) => getInProgressTasks(tasks)
    },
    {
        keywords: ['recent', 'latest', 'activity', 'new tasks', 'last created'],
        response: (tasks) => getRecentActivity(tasks)
    },
    {
        keywords: ['tip', 'advice', 'productivity', 'suggest', 'recommendation', 'insight', 'improve'],
        response: (tasks) => getProductivityTip(tasks)
    },
    {
        keywords: ['what should i do', 'what next', 'suggest task', 'what to do', 'recommend', 'which task', 'start with'],
        response: (tasks) => getWhatShouldIDo(tasks)
    },
    {
        keywords: ['what is taskflow', 'about project', 'what is this', 'about this app', 'tell me about'],
        response: "TaskFlow is a full-stack task management system built with **FastAPI** (Python backend) and **React + TypeScript** (frontend). It features user authentication, task CRUD, file attachments, comments, real-time WebSocket updates, and an analytics dashboard."
    },
    {
        keywords: ['tech stack', 'technology', 'tools used', 'built with', 'framework'],
        response: "🛠️ **Tech Stack:**\n• **Backend:** FastAPI (Python), SQLAlchemy, PostgreSQL\n• **Frontend:** React 18, TypeScript, Vite\n• **Auth:** JWT (python-jose + bcrypt)\n• **Charts:** Recharts\n• **Icons:** Lucide React\n• **Real-time:** WebSockets\n• **Deploy:** Docker + Docker Compose\n• **Styling:** CSS Variables (dark/light themes)"
    },
    {
        keywords: ['backend', 'fastapi', 'python', 'server', 'api'],
        response: "The backend is **FastAPI** (Python):\n• RESTful endpoints for tasks, users, comments, attachments\n• **SQLAlchemy** ORM + PostgreSQL\n• JWT authentication\n• File uploads & analytics endpoints\n• WebSocket server for real-time updates"
    },
    {
        keywords: ['frontend', 'react', 'typescript', 'vite', 'ui'],
        response: "Frontend: **React 18 + TypeScript + Vite**\n• Component-based architecture\n• React Router + Context API\n• Recharts for visualization\n• CSS Variables for theming\n• Responsive design"
    },
    {
        keywords: ['database', 'postgresql', 'sql', 'sqlalchemy', 'db', 'schema'],
        response: "**PostgreSQL** via SQLAlchemy ORM:\n• **Users** (id, email, full_name, hashed_password)\n• **Tasks** (id, title, description, status, priority, due_date, time_spent)\n• **Comments** (id, content, task_id, user_id)\n• **Attachments** (id, filename, file_path, task_id)"
    },
    {
        keywords: ['auth', 'authentication', 'login', 'jwt', 'token', 'register'],
        response: "Auth uses **JWT tokens**:\n• Login returns access token → stored in localStorage\n• PrivateRoute protects authenticated pages\n• python-jose validates tokens on backend\n• Passwords hashed with bcrypt"
    },
    {
        keywords: ['docker', 'container', 'deploy', 'compose'],
        response: "🐳 **Docker deployment:**\n• 3 services: frontend (Nginx), backend (uvicorn), database (PostgreSQL)\n• Run: `docker-compose up --build`"
    },
    {
        keywords: ['help', 'what can you do', 'features', 'commands', 'menu'],
        response: "Here's what I can do:\n\n📊 **Live Task Data:**\n• \"my tasks\" — Task summary & stats\n• \"overdue\" — Overdue task alerts\n• \"deadlines\" — Upcoming due dates\n• \"high priority\" — Critical tasks\n• \"in progress\" — Active work\n• \"recent\" — Latest activity\n• \"what should I do\" — Smart recommendation\n• \"tips\" — Productivity advice\n\n📖 **Project Info:**\n• \"tech stack\" — Technologies used\n• \"about\" — Project overview\n• \"database\" — Schema details\n• \"auth\" — Login flow"
    },
    {
        keywords: ['bye', 'goodbye', 'thanks', 'thank you'],
        response: "You're welcome! 😊 Keep crushing those tasks. I'm always here if you need help! 🚀"
    }
];

// ── Fallbacks ──
const fallbacks = [
    "I didn't catch that! Try asking about your **tasks**, **deadlines**, **priorities**, or say **\"help\"** to see everything I can do. 🤔",
    "Hmm, not sure about that. I can help with your **task summary**, **overdue alerts**, or **productivity tips**. Try one! 💡",
    "I specialize in your tasks and this project! Ask me **\"what should I do next\"** or **\"show my tasks\"** for real-time insights. 🎯"
];

/**
 * Main response function — now accepts live task data.
 */
export const getBotResponse = (userMessage: string, tasks: Task[]): BotResponse => {
    const msg = userMessage.toLowerCase().trim();

    if (!msg) {
        return { text: "Type a message! Try **\"my tasks\"** or **\"help\"** to get started. 😊", delay: 400 };
    }

    let bestMatch: KnowledgeEntry | null = null;
    let bestScore = 0;

    for (const entry of knowledgeBase) {
        let score = 0;
        for (const keyword of entry.keywords) {
            if (msg.includes(keyword)) {
                score += keyword.split(' ').length;
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestMatch = entry;
        }
    }

    if (bestMatch && bestScore > 0) {
        const text = typeof bestMatch.response === 'function'
            ? bestMatch.response(tasks)
            : bestMatch.response;
        return { text, delay: 600 + Math.random() * 900 };
    }

    const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    return { text: fallback, delay: 700 };
};
