import { AnimatePresence, motion } from 'motion/react';
import type { CSSProperties, FC, FocusEventHandler, PropsWithChildren, Ref } from 'react';

const EASING = [0.2, 0.8, 0.25, 1] as const;
const DURATION_SECONDS = 0.26;

const HIDDEN = { opacity: 0, y: '4%' };
const SHOWN = { opacity: 1, y: '0%' };
const TRANSITION = { duration: DURATION_SECONDS, ease: EASING };

const PANEL_STYLE: CSSProperties = {
  position: 'fixed',
  inset: 0,
  outline: 'none',
};

interface KkAppShellCurtainTransitionProps extends PropsWithChildren {
  in: boolean;
  onEnter?: () => void;
  onExited?: () => void;
  onFocus?: FocusEventHandler<HTMLDivElement>;
  tabIndex?: number;
  ref?: Ref<HTMLDivElement>;
}

export const KkAppShellCurtainTransition: FC<KkAppShellCurtainTransitionProps> = ({
  in: shown,
  onEnter,
  onExited,
  onFocus,
  tabIndex,
  ref,
  children,
}) => (
  <AnimatePresence onExitComplete={onExited}>
    {shown ? (
      <motion.div
        key="curtain"
        ref={ref}
        tabIndex={tabIndex}
        onFocus={onFocus}
        initial={HIDDEN}
        animate={SHOWN}
        exit={HIDDEN}
        transition={TRANSITION}
        onAnimationStart={onEnter}
        style={PANEL_STYLE}
      >
        {children}
      </motion.div>
    ) : null}
  </AnimatePresence>
);
