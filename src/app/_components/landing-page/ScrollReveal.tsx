'use client';

import { useRef, useEffect, type ReactNode } from 'react';
import { motion, useInView, useAnimation, type Variant } from 'framer-motion';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface ScrollRevealProps {
  children: ReactNode;
  /** Which direction the element slides in from */
  direction?: Direction;
  /** Delay before animation starts (seconds) */
  delay?: number;
  /** Duration of the animation (seconds) */
  duration?: number;
  /** Distance (px) to travel */
  distance?: number;
  /** Once: only animate in, never reverse */
  once?: boolean;
  className?: string;
}

const directionVariants: Record<
  Direction,
  { hidden: Variant; visible: Variant }
> = {
  up: { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } },
  down: { hidden: { opacity: 0, y: -40 }, visible: { opacity: 1, y: 0 } },
  left: { hidden: { opacity: 0, x: 60 }, visible: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0 } },
  none: { hidden: { opacity: 0 }, visible: { opacity: 1 } }
};

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.55,
  once = true,
  className
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const inView = useInView(ref, { once, margin: '-10% 0px -10% 0px' });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else if (!once) {
      controls.start('hidden');
    }
  }, [inView, controls, once]);

  const { hidden, visible } = directionVariants[direction];

  return (
    <motion.div
      ref={ref}
      initial='hidden'
      animate={controls}
      variants={{
        hidden,
        visible: {
          ...visible,
          transition: {
            duration,
            delay,
            ease: [0.22, 1, 0.36, 1] // custom ease-out-expo
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Staggered container — wraps a group and staggers each child's entrance */
interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function StaggerContainer({
  children,
  staggerDelay = 0.08,
  className
}: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const inView = useInView(ref, { once: true, margin: '-10% 0px -10% 0px' });

  useEffect(() => {
    if (inView) controls.start('visible');
  }, [inView, controls]);

  return (
    <motion.div
      ref={ref}
      initial='hidden'
      animate={controls}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: staggerDelay }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Individual staggered child item */
export function StaggerItem({
  children,
  direction = 'up',
  className
}: {
  children: ReactNode;
  direction?: Direction;
  className?: string;
}) {
  const { hidden, visible } = directionVariants[direction];
  return (
    <motion.div
      variants={{
        hidden,
        visible: {
          ...visible,
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
