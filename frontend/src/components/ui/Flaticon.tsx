import React from 'react';

export type FlaticonVariant = 'rr' | 'rs' | 'sr' | 'ss' | 'br' | 'tr' | 'brands';

export interface FlaticonProps extends React.HTMLAttributes<HTMLElement> {
  name: string;
  variant?: FlaticonVariant;
  className?: string;
  size?: number | string;
}

/**
 * Flaticon UIcons component
 *
 * Renders official Flaticon UIcons (e.g. `fi fi-rr-search`, `fi fi-rr-apps`)
 * Default variant is 'rr' (Regular Rounded).
 */
export const Flaticon: React.FC<FlaticonProps> = ({
  name,
  variant = 'rr',
  className = '',
  size,
  style,
  ...props
}) => {
  // Normalize icon class name (allow passing 'search' or 'fi-rr-search' or 'rr-search')
  let iconClass = name;
  if (name.startsWith('fi-')) {
    iconClass = name;
  } else if (name.startsWith('rr-') || name.startsWith('rs-') || name.startsWith('sr-') || name.startsWith('ss-') || name.startsWith('br-') || name.startsWith('tr-')) {
    iconClass = `fi-${name}`;
  } else {
    iconClass = `fi-${variant}-${name}`;
  }

  return (
    <i
      className={`fi ${iconClass} ${className}`.trim()}
      style={{
        ...(size ? { fontSize: typeof size === 'number' ? `${size}px` : size } : {}),
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
};

export default Flaticon;
