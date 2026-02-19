import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Plus, Search, Filter, ClipboardList, Trash2, Calendar } from 'lucide-react';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Badge from '../components/Badge';
import './TaskList.css';

const TaskList = () => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);

    // New Task Form State
    const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', due_date: '' });
    const [loading, setLoading] = useState(true);

    const fetchTasks = () => {
        setLoading(true);
        let query = '?';
        if (statusFilter) query += `status=${statusFilter}&`;
        if (search) query += `search=${search}&`;

        api.get(`/tasks/${query}`)
            .then(res => setTasks(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchTasks();
    }, [statusFilter, search]);

    const handleExport = async () => {
        try {
            const response = await api.get('/tasks/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'tasks_export.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Failed to export tasks", error);
            alert("Failed to export tasks. Please try again.");
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/tasks/', newTask);
            setShowModal(false);
            setNewTask({ title: '', description: '', priority: 'medium', due_date: '' });
            fetchTasks();
        } catch (err) {
            alert('Failed to create task');
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure?')) {
            await api.delete(`/tasks/${id}`);
            fetchTasks();
        }
    };

    return (
        <div className="task-list-container">
            <div className="task-list-header">
                <div>
                    <h1 className="task-list-title">My Tasks</h1>
                    <p className="task-list-subtitle">Manage and track your daily tasks.</p>
                </div>
                <div className="task-list-actions">
                    <button onClick={handleExport} className="btn-secondary">
                        <ClipboardList size={18} /> Export CSV
                    </button>
                    <button onClick={() => setShowModal(true)} className="btn-primary">
                        <Plus size={18} /> New Task
                    </button>
                </div>
            </div>

            <div className="filter-bar">
                <div className="search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="divider"></div>
                <div className="filter-wrapper">
                    <Filter size={16} className="filter-icon" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Status</option>
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                    </select>
                </div>
            </div>

            <div className="tasks-grid">
                {loading ? (
                    <Loading />
                ) : tasks.length === 0 ? (
                    <EmptyState
                        icon={ClipboardList}
                        title="No tasks found"
                        description="You don't have any tasks matching your criteria. Create a new task to get started."
                        action={
                            <button onClick={() => setShowModal(true)} className="btn-primary">
                                <Plus size={18} /> Create New Task
                            </button>
                        }
                    />
                ) : (
                    tasks.map((task: any, index: number) => (
                        <div
                            key={task.id}
                            className="task-card slide-up"
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div style={{ flex: 1 }}>
                                <Link to={`/tasks/${task.id}`} className="task-link">
                                    {task.title}
                                </Link>
                                <div className="task-meta">
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                        <Calendar size={14} />
                                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                                    </span>
                                </div>
                            </div>
                            <div className="task-actions">
                                <Badge type="status" value={task.status} />
                                <Badge type="priority" value={task.priority} />
                                <button
                                    onClick={() => handleDelete(task.id)}
                                    className="btn-icon-sm"
                                    title="Delete Task"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 className="modal-title">Create New Task</h2>
                        <form onSubmit={handleCreateTask}>
                            <div className="form-group">
                                <label className="form-label">Title</label>
                                <input
                                    placeholder="Enter task title"
                                    value={newTask.title}
                                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                    required
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    placeholder="Enter task description"
                                    value={newTask.description}
                                    onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                    className="form-input form-textarea"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-col">
                                    <label className="form-label">Priority</label>
                                    <select
                                        value={newTask.priority}
                                        onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                                        className="form-input"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div className="form-col">
                                    <label className="form-label">Due Date</label>
                                    <input
                                        type="date"
                                        value={newTask.due_date}
                                        onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-text">Cancel</button>
                                <button type="submit" className="btn-primary">Create Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskList;
