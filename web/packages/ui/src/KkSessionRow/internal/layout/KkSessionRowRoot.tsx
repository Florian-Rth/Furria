import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { ElementType, FC, PropsWithChildren } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { highlightMark, highlightPaint } from '../../../internal/highlight-paint';
import { redInk } from '../../../internal/red-ink';
import { rowDividerTop } from '../../../internal/row-divider';
import { KkIcon } from '../../../KkIcon';
import type { KkLinkSearch } from '../../../kk-link-search';
import type { KkSx } from '../../../kk-sx';

const ROW_GAP = 1.5;
const ROW_PADDING_Y = 1.5;

const targetPaint = (theme: Theme): CSSObject => ({
  appearance: 'none',
  backgroundColor: 'transparent',
  color: 'inherit',
  textAlign: 'left',
  textDecoration: 'none',
  borderWidth: 0,
  borderStyle: 'solid',
  cursor: 'pointer',
  ...focusRing(theme),
  '@media (hover: hover)': {
    '&:hover': {
      '& [data-kk-session-row-season]': redInk(theme),
      '& [data-kk-session-row-chevron]': { color: 'text.primary' },
    },
  },
});

interface KkSessionRowRootProps extends PropsWithChildren {
  highlight?: boolean;
  landing?: string;
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  search?: KkLinkSearch;
  sx?: KkSx;
}

export const KkSessionRowRoot: FC<KkSessionRowRootProps> = ({
  highlight = false,
  landing,
  component,
  to,
  params,
  search,
  sx,
  children,
}) => {
  const interactive = component !== undefined;
  const rowComponent = component ?? 'div';
  const routeProps = interactive ? { to, params, search } : {};
  const highlightProps = highlightMark(highlight);

  const chevron = interactive ? (
    <Box
      aria-hidden
      component="span"
      data-kk-session-row-chevron
      sx={{ display: 'inline-flex', alignSelf: 'center', color: 'text.secondary', flexShrink: 0 }}
    >
      <KkIcon name="chevron" size="small" />
    </Box>
  ) : null;

  return (
    <Stack
      component={rowComponent}
      {...routeProps}
      {...highlightProps}
      direction="row"
      data-kk-session-row
      data-kk-landing={landing}
      sx={[
        (theme) => ({
          width: '100%',
          minWidth: 0,
          alignItems: 'flex-start',
          gap: ROW_GAP,
          m: 0,
          px: 0,
          py: ROW_PADDING_Y,
          ...(interactive ? targetPaint(theme) : {}),
          ...rowDividerTop,
          ...(highlight ? highlightPaint(theme) : {}),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
      {chevron}
    </Stack>
  );
};
