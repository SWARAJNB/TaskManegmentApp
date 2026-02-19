import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Task, TaskCreate, TaskStatus, TaskPriority } from '../types';
import api from '../api/client';
import './TaskForm.css';

interface TaskFormProps {
    isOpen: boolean;
    onClose: () => void;
    onTaskSaved: () => void; // Callback to refresh parent list
    taskToEdit?: Task | null;
}

const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, onTaskSaved, taskToEdit }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
    const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
    const [dueDate, setDueDate] = useState('');
    const [timeSpent, setTimeSpent] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (taskToEdit) {
            setTitle(taskToEdit.title);
            setDescription(taskToEdit.description || '');
            setStatus(taskToEdit.status);
            setPriority(taskToEdit.priority);
            setDueDate(taskToEdit.due_date ? taskToEdit.due_date.split('T')[0] : '');
            setTimeSpent(taskToEdit.time_spent || 0);
        } else {
            resetForm();
        }
    }, [taskToEdit, isOpen]);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setStatus(TaskStatus.TODO);
        setPriority(TaskPriority.MEDIUM);
        setDueDate('');
        setTimeSpent(0);
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 200); // Match animation duration
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const taskData: TaskCreate = {
            title,
            description,
            status,
            priority,
            due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
            time_spent: timeSpent,
        };

        try {
            if (taskToEdit) {
                await api.put(`/tasks/${taskToEdit.id}`, taskData);
            } else {
                await api.post('/tasks/', taskData);
            }
            setIsLoading(false);
            onClose();        // Close modal immediately
            onTaskSaved();    // Refresh parent list
        } catch (error: any) {
            console.error("Failed to save task", error);
            alert(`Failed to save task: ${error?.response?.data?.detail || error.message || 'Unknown error'}`);
            setIsLoading(false);
        }
    };

    if (!isOpen && !isClosing) return null;

    return createPortal(
        <div className={`modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
            <div className={`modal-content ${isClosing ? 'closing' : ''}`} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{taskToEdit ? 'Edit Task' : 'Create New Task'}</h2>
                    <button className="close-btn" onClick={handleClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="task-form">
                    <div className="form-group">
                        <label className="form-label">Task Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Review Q1 Goals"
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add details about this task..."
                            className="form-textarea"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                                className="form-select"
                            >
                                <option value={TaskStatus.TODO}>Todo</option>
                                <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                                <option value={TaskStatus.DONE}>Done</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Priority</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                                className="form-select"
                            >
                                <option value={TaskPriority.LOW}>Low</option>
                                <option value={TaskPriority.MEDIUM}>Medium</option>
                                <option value={TaskPriority.HIGH}>High</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Due Date (Optional)</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Time Spent (Hours)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={timeSpent}
                                onChange={(e) => setTimeSpent(parseFloat(e.target.value) || 0)}
                                placeholder="e.g., 2.5"
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={handleClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : (taskToEdit ? 'Save Changes' : 'Create Task')}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default TaskForm;
