import React from 'react';

interface SplitTextProps {
  children: string;
  className?: string;
  hoverColor?: string;
  staggerMs?: number;
}

export const SplitText: React.FC<SplitTextProps> = ({
  children,
  className = '',
  hoverColor = 'text-white',
  staggerMs = 28,
}) => {
  const characters = children.split('');

  return (
    <span className={`split-text-wrapper relative inline-flex overflow-hidden whitespace-nowrap select-none ${className}`}>
      {/* Primary visible row (moves up and out on hover) */}
      <span className="inline-flex whitespace-nowrap leading-none" aria-hidden="true">
        {characters.map((char, index) => (
          <span
            key={index}
            className="split-char inline-block"
            style={{ transitionDelay: `${index * staggerMs}ms` }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>

      {/* Duplicate clone row (moves up from below into view on hover) */}
      <span
        className={`absolute inset-0 inline-flex whitespace-nowrap leading-none pointer-events-none ${hoverColor}`}
        aria-hidden="true"
      >
        {characters.map((char, index) => (
          <span
            key={index}
            className="split-char-clone inline-block"
            style={{ transitionDelay: `${index * staggerMs}ms` }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>

      {/* Screen-reader accessible label */}
      <span className="sr-only">{children}</span>
    </span>
  );
};

export default SplitText;
