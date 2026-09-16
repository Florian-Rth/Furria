import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { raisedSurface } from '../../../internal/raised-surface';
import type { KkScheme } from '../../../internal/scheme-paint';
import { applyScheme } from '../../../internal/scheme-paint';
import { kkTokens } from '../../../tokens';

const SCRIM_HEIGHT = 16;
const SCRIM_CLEARANCE = 2.5;

const scrim = (surface: string): string => `linear-gradient(to top, ${surface}, transparent)`;

const scrimScheme: KkScheme = {
  light: { backgroundImage: scrim(kkTokens.color.light.panel2) },
  dark: { backgroundImage: scrim(kkTokens.color.dark.panel2) },
};

export const KkModalFrameFooter: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction={{ xs: 'column-reverse', desktop: 'row' }}
    data-kk-modal-frame-footer
    sx={(theme) => ({
      minWidth: 0,
      position: 'sticky',
      bottom: 0,
      mt: SCRIM_CLEARANCE,
      pt: 1.5,
      gap: 1.25,
      flexWrap: { xs: 'nowrap', desktop: 'wrap' },
      alignItems: { xs: 'stretch', desktop: 'center' },
      justifyContent: { desktop: 'flex-end' },
      borderTopWidth: kkTokens.line.hair,
      borderTopStyle: 'solid',
      borderColor: 'divider',
      ...raisedSurface(theme),
      '&::before': {
        content: '""',
        position: 'absolute',
        insetInline: 0,
        bottom: '100%',
        height: SCRIM_HEIGHT,
        pointerEvents: 'none',
        ...applyScheme(theme, scrimScheme),
      },
      '& > [data-kk-alert]': { flexBasis: '100%', order: { xs: 1, desktop: -1 } },
      '& > [data-kk-button]': { flex: { desktop: '0 0 auto' }, minWidth: 0 },
    })}
  >
    {children}
  </Stack>
);
