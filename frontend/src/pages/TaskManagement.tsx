import { useState, useEffect } from 'react';
import api from '../api/client';
import { Task, TaskStatus } from '../types';
import Loading from '../components/Loading';
import TaskForm from '../components/TaskForm';
import { Plus, Filter, Search, Calendar, Edit2, Trash2, CheckCircle2, Clock } from 'lucide-react';
import './TaskManagement.css';
import { useWebSocket } from '../context/WebSocketContext';
import { useNavigate } from 'react-router-dom';

const TaskManagement = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const { lastMessage } = useWebSocket();

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const response = await api.get('/tasks/');
            setTasks(response.data);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [lastMessage]);

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await api.delete(`/tasks/${id}`);
                setTasks(tasks.filter(t => t.id !== id));
            } catch (error) {
                console.error("Failed to delete task", error);
                alert("Failed to delete task. Please try again.");
            }
        }
    };

    const handleEdit = (task: Task, e: React.MouseEvent) => {
        e.stopPropagation();
        setTaskToEdit(task);
        setIsTaskFormOpen(true);
    };

    const handleCreate = () => {
        setTaskToEdit(null);
        setIsTaskFormOpen(true);
    };

    const handleTaskSaved = () => {
        fetchTasks();
    };

    const filteredTasks = tasks.filter(task => {
        const matchesStatus = filterStatus === 'ALL' || task.status === filterStatus;
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesStatus && matchesSearch;
    });

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'todo': return 'To Do';
            case 'in_progress': return 'In Progress';
            case 'done': return 'Done';
            default: return status;
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="task-management-container fade-in">
            <header className="page-header">
                <div>
                    <h1 className="page-title">My Tasks</h1>
                    <p className="page-subtitle">Manage and track your work</p>
                </div>
                <button onClick={handleCreate} className="btn-primary">
                    <Plus size={20} /> New Task
                </button>
            </header>

            <div className="task-controls">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="filter-group">
                    <Filter size={18} className="filter-icon" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="filter-select"
                    >
                        <option value="ALL">All Status</option>
                        <option value={TaskStatus.TODO}>To Do</option>
                        <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                        <option value={TaskStatus.DONE}>Done</option>
                    </select>
                </div>
            </div>

            {filteredTasks.length === 0 ? (
                <div className="empty-state">
                    <CheckCircle2 size={48} className="empty-icon" />
                    <h3>No tasks found</h3>
                    <p>Try adjusting your search or create a new task</p>
                </div>
            ) : (
                <div className="task-table-wrapper">
                    <table className="task-table">
                        <thead>
                            <tr>
                                <th>Task</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th>Time</th>
                                <th>Due Date</th>
                                <th>Created</th>
                                <th className="actions-col">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTasks.map(task => (
                                <tr
                                    key={task.id}
                                    className="task-row"
                                    onClick={() => navigate(`/tasks/${task.id}`)}
                                >
                                    <td className="task-name-cell">
                                        <div className="task-name-text">
                                            <span className="task-title-text">{task.title}</span>
                                            {task.description && (
                                                <span className="task-desc-text">{task.description}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-pill ${task.status.replace(' ', '-').toLowerCase()}`}>
                                            {getStatusLabel(task.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`priority-pill ${task.priority.toLowerCase()}`}>
                                            {task.priority}
                                        </span>
                                    </td>
                                    <td className="time-cell">
                                        {task.time_spent ? (
                                            <span className="time-badge">
                                                <Clock size={13} /> {task.time_spent}h
                                            </span>
                                        ) : (
                                            <span className="text-muted">—</span>
                                        )}
                                    </td>
                                    <td className="date-cell">
                                        {task.due_date ? (
                                            <span className="date-text">
                                                <Calendar size={13} />
                                                {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        ) : (
                                            <span className="text-muted">—</span>
                                        )}
                                    </td>
                                    <td className="date-cell">
                                        <span className="date-text">
                                            {new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button onClick={(e) => handleEdit(task, e)} className="action-btn edit" title="Edit">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={(e) => handleDelete(task.id, e)} className="action-btn delete" title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <TaskForm
                isOpen={isTaskFormOpen}
                onClose={() => setIsTaskFormOpen(false)}
                onTaskSaved={handleTaskSaved}
                taskToEdit={taskToEdit}
            />
        </div>
    );
};

export default TaskManagement;
