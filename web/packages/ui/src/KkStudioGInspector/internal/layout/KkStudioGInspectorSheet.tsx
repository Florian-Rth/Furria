import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import {
  STUDIO_G_EASE,
  STUDIO_G_WIDE,
} from '../../../KkStudioGDesk/internal/logic/studio-g-desk-queries';
import { kkTokens } from '../../../tokens';

const SLIDE = `transform 320ms ${STUDIO_G_EASE}, opacity 220ms ease-out, visibility 0s linear 320ms`;
const SLIDE_IN = `transform 320ms ${STUDIO_G_EASE}, opacity 180ms ease-out, visibility 0s`;

interface KkStudioGInspectorSheetProps extends PropsWithChildren {
  open: boolean;
  label: string;
}

export const KkStudioGInspectorSheet: FC<KkStudioGInspectorSheetProps> = ({
  open,
  label,
  children,
}) => (
  <Stack
    role="region"
    aria-label={label}
    aria-hidden={!open}
    inert={!open}
    data-open={open}
    data-kk-studio-g-sheet
    sx={(theme) => ({
      position: 'absolute',
      inset: 0,
      zIndex: 2,
      minHeight: 0,
      borderRadius: `${kkTokens.radius.base}px ${kkTokens.radius.base}px 0 0`,
      backgroundColor: (theme.vars ?? theme).palette.background.paper,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${(theme.vars ?? theme).palette.divider}, ${kkTokens.shadow.sheetSoft}`,
      transform: 'translateY(calc(100% + 1rem))',
      visibility: 'hidden',
      transition: SLIDE,
      '&[data-open="true"]': { transform: 'none', visibility: 'visible', transition: SLIDE_IN },
      [STUDIO_G_WIDE]: {
        borderRadius: `${kkTokens.radius.base}px`,
        boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${(theme.vars ?? theme).palette.divider}`,
        transform: 'translateX(1.5rem)',
        opacity: 0,
        '&[data-open="true"]': { transform: 'none', opacity: 1, visibility: 'visible' },
      },
      '@media (prefers-reduced-motion: reduce)': { transform: 'none' },
    })}
  >
    {children}
  </Stack>
);
