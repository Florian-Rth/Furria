import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { trackEdgeOf } from '../../../KkShell/internal/track-edge';
import { kkTokens } from '../../../tokens';
import { useCurrentRowInView } from '../logic/use-current-row-in-view';
import { useStepsDismiss } from '../logic/use-steps-dismiss';

const WIDE = '@container kk-studio-e (min-aspect-ratio: 5/4)';
const EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
const SLIDE = `transform 340ms ${EASE}, visibility 0s linear 340ms`;
const SLIDE_IN = `transform 340ms ${EASE}, visibility 0s`;
const bleed = (side: 'left' | 'right' | 'bottom'): string => `calc(-1 * ${trackEdgeOf(side)})`;

interface KkStudioEStepsRootProps extends PropsWithChildren {
  open: boolean;
  label: string;
  onClose: () => void;
}

export const KkStudioEStepsRoot: FC<KkStudioEStepsRootProps> = ({
  open,
  label,
  onClose,
  children,
}) => {
  const dismiss = useStepsDismiss(open, onClose);
  const panel = useCurrentRowInView(open);

  return (
    <Box
      data-kk-studio-e-steps
      data-open={open}
      sx={{
        position: 'fixed',
        top: 0,
        left: bleed('left'),
        right: bleed('right'),
        bottom: bleed('bottom'),
        overflow: 'clip',
        zIndex: 20,
        pointerEvents: 'none',
        '&[data-open="true"]': { pointerEvents: 'auto' },
      }}
    >
      <Box
        aria-hidden
        onClick={onClose}
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundColor: `color-mix(in srgb, ${kkTokens.overlay.scrimInk} 42%, transparent)`,
          opacity: open ? 1 : 0,
          transition: 'opacity 260ms ease-out',
          [WIDE]: {
            backgroundColor: `color-mix(in srgb, ${kkTokens.overlay.scrimInk} 18%, transparent)`,
          },
        }}
      />
      <Stack
        role="dialog"
        aria-modal
        aria-label={label}
        aria-hidden={!open}
        data-kk-studio-e-steps-panel
        ref={panel}
        sx={(theme) => ({
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: '75%',
          minHeight: 0,
          pb: trackEdgeOf('bottom'),
          borderRadius: `${kkTokens.radius.base * 1.5}px ${kkTokens.radius.base * 1.5}px 0 0`,
          backgroundColor: (theme.vars ?? theme).palette.background.paper,
          boxShadow: kkTokens.shadow.floating,
          visibility: open ? 'visible' : 'hidden',
          transform: open ? 'none' : 'translateY(calc(100% + 2rem))',
          transition: open ? SLIDE_IN : SLIDE,
          [WIDE]: {
            left: 'auto',
            right: trackEdgeOf('right'),
            top: 0,
            bottom: trackEdgeOf('bottom'),
            width: 'calc(clamp(18rem, 34cqw, 30rem) + 2rem)',
            maxHeight: 'none',
            pb: 0,
            borderRadius: `${kkTokens.radius.base}px`,
            transform: open ? 'none' : 'translateX(calc(100% + 2rem))',
          },
        })}
      >
        <Box
          aria-hidden
          {...dismiss}
          sx={{
            display: 'grid',
            placeItems: 'center',
            height: '1.5rem',
            flexShrink: 0,
            touchAction: 'none',
            cursor: 'grab',
            [WIDE]: { display: 'none' },
          }}
        >
          <Box
            sx={(theme) => ({
              width: '2.5rem',
              height: '0.3125rem',
              borderRadius: `${kkTokens.radius.pill}px`,
              backgroundColor: (theme.vars ?? theme).palette.divider,
            })}
          />
        </Box>
        {children}
      </Stack>
    </Box>
  );
};
