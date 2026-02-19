import './Badge.css';

interface BadgeProps {
    type: 'status' | 'priority';
    value: string;
}

const Badge = ({ type, value }: BadgeProps) => {
    let bg = '', text = '', label = '';

    if (type === 'status') {
        const colors: any = {
            todo: { bg: 'var(--border)', text: 'var(--text-secondary)' },
            in_progress: { bg: 'var(--primary-light)', text: 'var(--primary)' },
            done: { bg: 'var(--success-bg)', text: 'var(--success)' },
        };
        const color = colors[value] || colors.todo;
        bg = color.bg;
        text = color.text;
        label = value.replace('_', ' ');
    } else {
        const colors: any = {
            low: { bg: 'var(--surface-hover)', text: 'var(--text-secondary)' },
            medium: { bg: 'var(--warning-bg)', text: 'var(--warning)' },
            high: { bg: 'var(--danger-bg)', text: 'var(--danger)' },
        };
        const color = colors[value] || colors.medium;
        bg = color.bg;
        text = color.text;
        label = value;
    }

    return (
        <span className="badge" style={{ backgroundColor: bg, color: text }}>
            {label}
        </span>
    );
};

export default Badge;
