import Stack from '@mui/material/Stack';
import { AnimatePresence, motion } from 'motion/react';
import type { CSSProperties, FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';
import { useAppShellCurtain } from '../logic/app-shell-curtain-context';
import { useCurtainDismiss } from '../logic/use-curtain-dismiss';
import { KkAppShellGlow } from '../ui/KkAppShellGlow';

const CURTAIN_Z_INDEX = 1300;
const GLOW = { width: 460, height: 400, top: -80 } as const;
const EASING = [0.2, 0.8, 0.25, 1] as const;
const DURATION_SECONDS = 0.26;

const HIDDEN = { opacity: 0, y: '4%' };
const SHOWN = { opacity: 1, y: '0%' };
const TRANSITION = { duration: DURATION_SECONDS, ease: EASING };

const CURTAIN_STYLE: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: CURTAIN_Z_INDEX,
};

export const KkAppShellCurtain: FC<PropsWithChildren> = ({ children }) => {
  const curtain = useAppShellCurtain();
  useCurtainDismiss(curtain.isOpen, curtain.close);

  return (
    <AnimatePresence>
      {curtain.isOpen ? (
        <motion.div
          key="curtain"
          initial={HIDDEN}
          animate={SHOWN}
          exit={HIDDEN}
          transition={TRANSITION}
          style={CURTAIN_STYLE}
        >
          <Stack
            role="dialog"
            aria-modal
            aria-label="Navigation"
            data-kk-app-shell-curtain
            sx={(theme) => ({
              display: { xs: 'flex', desktop: 'none' },
              position: 'relative',
              isolation: 'isolate',
              overflow: 'hidden',
              height: '100%',
              backgroundColor: 'background.default',
              ...theme.applyStyles('dark', { backgroundColor: kkTokens.chrome.dark.base }),
              color: 'text.primary',
              px: 2.75,
              pt: 6.25,
              pb: 2.75,
              gap: 2,
            })}
          >
            <KkAppShellGlow tone="gold" {...GLOW} centred />
            {children}
          </Stack>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
