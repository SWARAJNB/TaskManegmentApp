import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { ArrowLeft, Send, Paperclip, FileText, Download, Trash2, Clock, AlertCircle, CheckCircle2, Edit2, X, Check } from 'lucide-react';
import Loading from '../components/Loading';
import Badge from '../components/Badge';
import { Task } from '../types';
import MarkdownRenderer from '../components/MarkdownRenderer';
import './TaskDetail.css';

const TaskDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editingContent, setEditingContent] = useState('');

    const fetchTask = () => {
        api.get(`/tasks/${id}`)
            .then(res => setTask(res.data))
            .catch(err => {
                console.error(err);
                if (err.response && err.response.status === 404) {
                    alert('Task not found');
                    navigate('/tasks');
                }
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchTask();
    }, [id]);

    const handleUpdateStatus = async (status: string) => {
        setTask(prev => prev ? { ...prev, status: status as any } : prev);
        try {
            await api.put(`/tasks/${id}`, { status });
            fetchTask();
        } catch (err) {
            console.error(err);
            fetchTask();
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await api.post(`/tasks/${id}/comments/`, { content: newComment });
            setNewComment('');
            fetchTask();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditComment = (comment: any) => {
        setEditingCommentId(comment.id);
        setEditingContent(comment.content);
    };

    const handleSaveComment = async (commentId: number) => {
        if (!editingContent.trim()) return;
        try {
            await api.put(`/comments/${commentId}`, { content: editingContent });
            setEditingCommentId(null);
            setEditingContent('');
            fetchTask();
        } catch (err) {
            console.error("Failed to update comment", err);
            alert("Failed to update comment.");
        }
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditingContent('');
    };

    const handleDeleteComment = async (commentId: number) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await api.delete(`/comments/${commentId}`);
            fetchTask();
        } catch (err) {
            console.error("Failed to delete comment", err);
            alert("Failed to delete comment.");
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
        let file: File | null = null;
        if ('files' in event.target && event.target.files) {
            file = event.target.files[0];
        } else if ('dataTransfer' in event && event.dataTransfer.files) {
            file = event.dataTransfer.files[0];
        }

        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post(`/tasks/${id}/attachments/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            fetchTask();
        } catch (err) {
            console.error("Upload failed", err);
            alert("Failed to upload file");
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        await handleFileUpload(e);
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this task?')) {
            try {
                await api.delete(`/tasks/${id}`);
                navigate('/tasks');
            } catch (err) {
                console.error(err);
                alert('Failed to delete task');
            }
        }
    };

    const handleDownload = async (fileId: number, filename: string) => {
        try {
            const response = await api.get(`/attachments/${fileId}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (err) {
            console.error("Download failed", err);
            alert("Failed to download file");
        }
    };

    const handleDeleteAttachment = async (fileId: number) => {
        if (!window.confirm('Delete this attachment?')) return;
        try {
            await api.delete(`/attachments/${fileId}`);
            fetchTask();
        } catch (err) {
            console.error("Failed to delete attachment", err);
            alert("Failed to delete attachment.");
        }
    };

    if (loading) return <Loading />;
    if (!task) return <div>Task not found</div>;

    return (
        <div className="task-detail-container">
            <button onClick={() => navigate('/tasks')} className="btn-back">
                <ArrowLeft size={18} /> Back to Tasks
            </button>

            <div className="task-detail-grid">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="detail-card">
                        <div className="task-header">
                            <div>
                                <h1 className="task-title">{task.title}</h1>
                                <div className="task-meta">
                                    <Badge type="status" value={task.status} />
                                    <Badge type="priority" value={task.priority} />
                                    {task.time_spent ? (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                            🕐 {task.time_spent}h logged
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                            <button onClick={handleDelete} className="btn-icon-danger" title="Delete Task">
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <h3 className="section-title">Description</h3>
                            <div className="description-text">
                                {task.description ? (
                                    <MarkdownRenderer content={task.description} />
                                ) : (
                                    'No description provided.'
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="section-title">Attachments</h3>
                            <div
                                className={`upload-area ${isDragging ? 'dragging' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Paperclip size={24} className="upload-icon" />
                                <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} />
                                <p className="upload-text">Click to upload or drag and drop</p>
                                <p className="upload-hint">SVG, PNG, JPG or PDF</p>
                            </div>

                            <div className="attachments-list">
                                {task.attachments?.map((file: any) => (
                                    <div key={file.id} className="file-card">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                                            <div className="file-icon-wrapper">
                                                <FileText size={18} />
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontWeight: '500', fontSize: '0.9rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.filename}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{new Date(file.uploaded_at).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                                            <button onClick={() => handleDownload(file.id, file.filename)} className="btn-icon" style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} title="Download">
                                                <Download size={17} />
                                            </button>
                                            <button onClick={() => handleDeleteAttachment(file.id)} className="btn-icon" style={{ color: 'var(--danger)', cursor: 'pointer' }} title="Delete">
                                                <Trash2 size={17} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="detail-card">
                        <h3 className="section-title">Comments</h3>
                        <div className="comments-list">
                            {task.comments?.length === 0 ? (
                                <p style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No comments yet.</p>
                            ) : (
                                task.comments?.map((comment: any) => (
                                    <div key={comment.id} className="comment-item">
                                        <div className="comment-avatar">
                                            {comment.author?.full_name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="comment-content-wrapper" style={{ flex: 1 }}>
                                            <div className="comment-header">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span className="comment-author">{comment.author?.full_name || 'User'}</span>
                                                    <span className="comment-date">{new Date(comment.created_at).toLocaleString()}</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                    {editingCommentId === comment.id ? (
                                                        <>
                                                            <button onClick={() => handleSaveComment(comment.id)} className="btn-icon-sm" title="Save" style={{ color: 'var(--success)', cursor: 'pointer', background: 'none', border: 'none', padding: '0.25rem' }}>
                                                                <Check size={15} />
                                                            </button>
                                                            <button onClick={handleCancelEdit} className="btn-icon-sm" title="Cancel" style={{ color: 'var(--text-secondary)', cursor: 'pointer', background: 'none', border: 'none', padding: '0.25rem' }}>
                                                                <X size={15} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => handleEditComment(comment)} className="btn-icon-sm" title="Edit" style={{ color: 'var(--text-secondary)', cursor: 'pointer', background: 'none', border: 'none', padding: '0.25rem' }}>
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button onClick={() => handleDeleteComment(comment.id)} className="btn-icon-sm" title="Delete" style={{ color: 'var(--danger)', cursor: 'pointer', background: 'none', border: 'none', padding: '0.25rem' }}>
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {editingCommentId === comment.id ? (
                                                <textarea
                                                    value={editingContent}
                                                    onChange={(e) => setEditingContent(e.target.value)}
                                                    className="comment-edit-input"
                                                    autoFocus
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.65rem 0.85rem',
                                                        borderRadius: '10px',
                                                        border: '1px solid var(--primary)',
                                                        background: 'var(--background)',
                                                        color: 'var(--text)',
                                                        fontSize: '0.9rem',
                                                        fontFamily: 'inherit',
                                                        resize: 'none',
                                                        minHeight: '60px',
                                                        outline: 'none',
                                                        boxShadow: '0 0 0 3px var(--primary-light)',
                                                    }}
                                                />
                                            ) : (
                                                <div className="comment-bubble">
                                                    <MarkdownRenderer content={comment.content} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <form onSubmit={handleAddComment} className="comment-form">
                            <div className="comment-input-wrapper">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="comment-input"
                                />
                                <button
                                    type="submit"
                                    disabled={!newComment.trim()}
                                    className="send-btn"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="detail-card">
                        <h3 className="section-title">Status</h3>
                        <div className="status-options">
                            {['todo', 'in_progress', 'done'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => handleUpdateStatus(status)}
                                    className={`status-btn ${task.status === status ? 'active' : ''}`}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        {status === 'todo' && <AlertCircle size={18} />}
                                        {status === 'in_progress' && <Clock size={18} />}
                                        {status === 'done' && <CheckCircle2 size={18} />}
                                        <span style={{ textTransform: 'capitalize', fontWeight: '500' }}>{status.replace('_', ' ')}</span>
                                    </div>
                                    {task.status === status && <CheckCircle2 size={18} fill="currentColor" color="white" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="detail-card">
                        <h3 className="section-title">Details</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div className="detail-item">
                                <div className="detail-label">Assignee</div>
                                <div className="detail-value">
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                        {task.owner?.full_name?.charAt(0)}
                                    </div>
                                    <div>{task.owner?.full_name}</div>
                                </div>
                            </div>
                            <div className="detail-item">
                                <div className="detail-label">Created</div>
                                <div className="detail-value">{new Date(task.created_at).toLocaleDateString()}</div>
                            </div>
                            <div className="detail-item">
                                <div className="detail-label">Due Date</div>
                                <div className="detail-value">{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date set'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetail;
