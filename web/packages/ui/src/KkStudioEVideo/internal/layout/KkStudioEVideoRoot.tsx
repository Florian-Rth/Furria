import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

const EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
const SLIDE_OUT = `opacity 220ms ease-out, transform 320ms ${EASE}, visibility 0s linear 320ms`;
const SLIDE_IN = `opacity 260ms ease-out, transform 320ms ${EASE}, visibility 0s`;

interface KkStudioEVideoRootProps extends PropsWithChildren {
  open: boolean;
  label: string;
}

export const KkStudioEVideoRoot: FC<KkStudioEVideoRootProps> = ({ open, label, children }) => (
  <Stack
    role="region"
    aria-label={label}
    data-kk-studio-e-video
    data-open={open}
    sx={(theme) => ({
      position: 'absolute',
      inset: 0,
      zIndex: 5,
      gap: 0.5,
      p: 0.75,
      borderRadius: { xs: 0, desktop: `${kkTokens.radius.base}px` },
      backgroundColor: (theme.vars ?? theme).palette.background.paper,
      boxShadow: kkTokens.shadow.raised,
      opacity: 0,
      visibility: 'hidden',
      pointerEvents: 'none',
      transform: 'translateY(1.5rem)',
      transition: SLIDE_OUT,
      [theme.breakpoints.up('desktop')]: {
        left: 'auto',
        right: 'calc((100% - 100vw) / 2 + 1.25rem)',
        width: '22rem',
        transform: 'translateX(1.5rem)',
      },
      '&[data-open="true"]': {
        opacity: 1,
        visibility: 'visible',
        pointerEvents: 'auto',
        transform: 'none',
        transition: SLIDE_IN,
      },
    })}
  >
    {children}
  </Stack>
);
