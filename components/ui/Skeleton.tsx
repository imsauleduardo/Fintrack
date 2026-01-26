import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
    width?: string | number;
    height?: string | number;
    variant?: 'rectangular' | 'circular' | 'rounded';
}

const Skeleton = ({
    className = '',
    width,
    height,
    variant = 'rounded',
    style,
    ...props
}: SkeletonProps) => {

    const getVariantClasses = () => {
        switch (variant) {
            case 'circular': return 'rounded-full';
            case 'rectangular': return 'rounded-none';
            default: return 'rounded-lg'; // rounded
        }
    };

    const styles = {
        width: width,
        height: height,
        ...style
    };

    return (
        <div
            className={`animate-shimmer bg-muted ${getVariantClasses()} ${className}`}
            style={styles}
            {...props}
        />
    );
};

export default Skeleton;