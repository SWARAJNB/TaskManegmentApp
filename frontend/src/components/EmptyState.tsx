import React from 'react';
import { LucideIcon } from 'lucide-react';
import './EmptyState.css';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode;
}

const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => {
    return (
        <div className="empty-state-container">
            <div className="empty-state-icon-wrapper">
                <Icon size={48} color="var(--text-secondary)" />
            </div>
            <h3 className="empty-state-title">{title}</h3>
            <p className="empty-state-description">{description}</p>
            {action}
        </div>
    );
};

export default EmptyState;
