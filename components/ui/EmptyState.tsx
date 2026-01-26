import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

const EmptyState = ({ icon: Icon, title, description, action, className = '' }: EmptyStateProps) => {
    return (
        <div className={`flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-dashed border-border bg-muted/30 ${className}`}>
            <div className="p-4 bg-muted rounded-full mb-4">
                <Icon className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-muted-foreground max-w-xs mb-6">
                    {description}
                </p>
            )}
            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </div>
    );
};

export default EmptyState;