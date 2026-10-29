import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { safeArea } from './internal/safe-area';
import type { KkScheme } from './internal/scheme-paint';
import { applyScheme } from './internal/scheme-paint';
import { kkTokens } from './tokens';

const { gutter, actionFadeHeight } = kkTokens.shell;
const WIDE_DEEDS_WIDTH = '30rem';

const fadeGradient = (bg: string): string =>
  `linear-gradient(to bottom, ${alpha(bg, 0)} 0, ${bg} ${actionFadeHeight}px)`;

const fadeScheme: KkScheme = {
  light: { backgroundImage: fadeGradient(kkTokens.color.light.bg) },
  dark: { backgroundImage: fadeGradient(kkTokens.color.dark.bg) },
};

const footPaint = (theme: Theme): CSSObject => ({
  position: 'relative',
  isolation: 'isolate',
  minWidth: 0,
  gap: theme.spacing(0.5),
  alignItems: 'stretch',
  [theme.breakpoints.up('md')]: { alignItems: 'flex-end' },
  '&::before': {
    content: '""',
    position: 'absolute',
    zIndex: -1,
    top: -actionFadeHeight,
    left: `calc(-1 * ${safeArea('left', gutter)})`,
    right: `calc(-1 * ${safeArea('right', gutter)})`,
    bottom: `calc(-1 * ${safeArea('bottom', gutter)})`,
    pointerEvents: 'none',
    ...applyScheme(theme, fadeScheme),
  },
});

interface KkActionFootProps extends PropsWithChildren {
  notice?: string | null;
}

export const KkActionFoot: FC<KkActionFootProps> = ({ notice = null, children }) => {
  const noticeLine =
    notice === null ? null : (
      <Box
        component="p"
        role="status"
        data-kk-action-foot-notice
        sx={{
          m: 0,
          width: { xs: 'auto', md: WIDE_DEEDS_WIDTH },
          maxWidth: '100%',
          typography: 'caption',
          fontWeight: 700,
          color: 'text.secondary',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'clip',
          textOverflow: 'ellipsis',
        }}
      >
        {notice}
      </Box>
    );

  return (
    <Stack data-kk-action-foot sx={footPaint}>
      {noticeLine}
      <Stack
        direction="row"
        sx={{
          gap: 1,
          minWidth: 0,
          width: { xs: 'auto', md: WIDE_DEEDS_WIDTH },
          maxWidth: '100%',
          '& > *': { flex: '1 1 0', minWidth: 0 },
          '& [data-kk-hold-button] > .MuiButton-root': { minHeight: kkTokens.tapTarget },
        }}
      >
        {children}
      </Stack>
    </Stack>
  );
};
