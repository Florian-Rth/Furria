import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

const EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

export type KkStudioIDetailPlacement = 'sheet' | 'pane';

interface KkStudioIDetailRootProps extends PropsWithChildren {
  label: string;
  placement: KkStudioIDetailPlacement;
  open: boolean;
}

export const KkStudioIDetailRoot: FC<KkStudioIDetailRootProps> = ({
  label,
  placement,
  open,
  children,
}) => {
  const sheet = placement === 'sheet';

  return (
    <Stack
      role={sheet ? 'dialog' : 'region'}
      aria-label={label}
      aria-hidden={sheet && !open}
      data-kk-studio-i-detail={placement}
      data-open={open}
      sx={(theme) => ({
        minHeight: 0,
        minWidth: 0,
        borderRadius: `${kkTokens.radius.base}px`,
        backgroundColor: (theme.vars ?? theme).palette.background.paper,
        ...(sheet
          ? {
              gridColumn: 'counts-start / controls-end',
              gridRow: 'counts-start / controls-end',
              zIndex: 10,
              gap: 0.75,
              px: 1.5,
              py: 1,
              boxShadow: `${kkTokens.shadow.floating}, inset 0 0 0 ${kkTokens.line.hair}px ${(theme.vars ?? theme).palette.divider}`,
              opacity: open ? 1 : 0,
              visibility: open ? 'visible' : 'hidden',
              transform: open ? 'none' : 'scale(0.97)',
              transition: open
                ? `transform 280ms ${EASE}, opacity 200ms ease-out, visibility 0s`
                : `transform 280ms ${EASE}, opacity 200ms ease-out, visibility 0s linear 280ms`,
            }
          : {
              flex: 1,
              gap: 1,
              p: 1.5,
              pt: 1.25,
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${(theme.vars ?? theme).palette.divider}`,
            }),
      })}
    >
      {children}
    </Stack>
  );
};
