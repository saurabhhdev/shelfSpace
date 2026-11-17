import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

export interface ParticleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  children: React.ReactNode;
  className?: string;
}

/**
 * Particle Button Component
 * Inspired by @kokonutd on 21st.dev
 * Emits radial particles upon click with dark neon green and metallic chromium tones.
 * Sharp 90-degree corners with solid/dotted line precision.
 */
export const ParticleButton: React.FC<ParticleButtonProps> = ({
  href,
  variant = 'primary',
  children,
  className,
  onClick,
  ...props
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  const triggerParticles = () => {
    const burst: Particle[] = [];
    const colors = ['#10b981', '#059669', '#34d399', '#9ca3af', '#f4f4f7', '#6b7280'];
    const count = 18;

    for (let i = 0; i < count; i++) {
      const angle = (i * (360 / count) + (Math.random() * 20 - 10)) * (Math.PI / 180);
      const distance = 35 + Math.random() * 30;
      burst.push({
        id: Date.now() + i + Math.random(),
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        size: 2.5 + Math.random() * 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    setParticles(burst);
    setTimeout(() => setParticles([]), 650);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerParticles();
    if (onClick) onClick(e);
  };

  const variantStyles = {
    primary:
      'bg-[#10b981] hover:bg-[#059669] text-black dark:bg-[#10b981] dark:hover:bg-[#059669] dark:text-black light:bg-[#059669] light:hover:bg-[#047857] light:text-white font-semibold border border-[#10b981] light:border-[#059669] shadow-none',
    secondary:
      'bg-[#0e0e14] hover:bg-[#181822] text-[#f4f4f7] dark:bg-[#0e0e14] dark:hover:bg-[#181822] dark:text-[#f4f4f7] light:bg-[#f1f3f6] light:hover:bg-[#e2e8f0] light:text-[#09090b] border border-[#242432] dark:border-[#242432] light:border-[#d4d4dc] shadow-none',
    outline:
      'bg-transparent hover:bg-[#12121a]/80 dark:hover:bg-[#12121a]/80 light:hover:bg-[#f1f3f6]/80 text-[#f4f4f7] dark:text-[#f4f4f7] light:text-[#09090b] border border-[#242432] dark:border-[#242432] light:border-[#d4d4dc] hover:border-[#10b981] hover:text-[#10b981] light:hover:border-[#059669] light:hover:text-[#059669] shadow-none',
    ghost:
      'bg-transparent hover:bg-[#12121a]/50 dark:hover:bg-[#12121a]/50 light:hover:bg-[#f1f3f6]/50 text-[#a1a1aa] dark:text-[#a1a1aa] light:text-[#64748b] hover:text-[#10b981] light:hover:text-[#059669] border border-transparent',
  };

  const baseClasses = cn(
    'relative inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all duration-150 cursor-pointer select-none rounded-none',
    variantStyles[variant],
    className
  );

  const innerContent = (
    <>
      <span className="relative z-10 flex items-center gap-1.5">{children}</span>

      {/* Particle Burst Elements */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="absolute pointer-events-none rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              left: '50%',
              top: '50%',
              marginLeft: -p.size / 2,
              marginTop: -p.size / 2,
            }}
          />
        ))}
      </AnimatePresence>
    </>
  );

  if (href) {
    return (
      <Link
        to={href}
        className={baseClasses}
        onClick={() => triggerParticles()}
      >
        {innerContent}
      </Link>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={baseClasses}
      {...(props as any)}
    >
      {innerContent}
    </motion.button>
  );
};

export default ParticleButton;
