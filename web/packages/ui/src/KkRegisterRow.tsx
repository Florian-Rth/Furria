import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { ElementType, FC, PropsWithChildren } from 'react';
import { focusRing } from './internal/focus-ring';
import type { KkGroupTone } from './internal/group-tone';
import { highlightMark, highlightPaint } from './internal/highlight-paint';
import { inkWashSurface } from './internal/ink-wash';
import { KkGroupToneRail } from './internal/KkGroupToneRail';
import { redInk } from './internal/red-ink';
import { rowDividerTop } from './internal/row-divider';
import { KkIcon } from './KkIcon';
import type { KkLinkSearch } from './kk-link-search';
import { kkTokens } from './tokens';

const SELECTED_WASH_LIGHT = '8%';
const SELECTED_WASH_DARK = '13%';
const RAIL_GUTTER = 1.5;

const selectedPaint = (theme: Theme, selected: boolean): CSSObject =>
  selected ? inkWashSurface(theme, SELECTED_WASH_LIGHT, SELECTED_WASH_DARK) : {};

const targetPaint = (theme: Theme): CSSObject => ({
  appearance: 'none',
  backgroundColor: 'transparent',
  color: 'inherit',
  textAlign: 'left',
  textDecoration: 'none',
  borderWidth: 0,
  borderStyle: 'solid',
  m: 0,
  p: 0,
  cursor: 'pointer',
  ...focusRing(theme),
  '@media (hover: hover)': {
    '&:hover': {
      '& [data-kk-heading]': redInk(theme),
      '& [data-kk-register-row-chevron]': { color: 'text.primary' },
    },
  },
});

interface KkRegisterRowProps extends PropsWithChildren {
  groupTone?: KkGroupTone;
  selected?: boolean;
  dimmed?: boolean;
  highlight?: boolean;
  landing?: string;
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  search?: KkLinkSearch;
}

export const KkRegisterRow: FC<KkRegisterRowProps> = ({
  groupTone,
  selected = false,
  dimmed = false,
  highlight = false,
  landing,
  component,
  to,
  params,
  search,
  children,
}) => {
  const rail = groupTone === undefined ? null : <KkGroupToneRail tone={groupTone} />;
  const opacity = dimmed ? kkTokens.opacity.dimmed : 1;
  const interactive = component !== undefined;
  const bodyComponent = component ?? 'div';
  const routeProps = interactive ? { to, params, search } : {};
  const highlightProps = highlightMark(highlight);

  const chevron = interactive ? (
    <Box
      aria-hidden
      component="span"
      data-kk-register-row-chevron
      sx={{ display: 'inline-flex', alignSelf: 'center', color: 'text.secondary', flexShrink: 0 }}
    >
      <KkIcon name="chevron" size="small" />
    </Box>
  ) : null;

  return (
    <Stack
      direction="row"
      {...highlightProps}
      data-kk-register-row
      data-kk-landing={landing}
      sx={(theme) => ({
        gap: RAIL_GUTTER,
        minWidth: 0,
        py: 1.25,
        px: { xs: 0.5, desktop: 1 },
        opacity,
        borderRadius: `${kkTokens.radius.base}px`,
        ...rowDividerTop,
        ...selectedPaint(theme, selected),
        ...(highlight ? highlightPaint(theme) : {}),
      })}
    >
      {rail}
      <Stack
        component={bodyComponent}
        {...routeProps}
        direction="row"
        data-kk-register-row-body
        sx={(theme) => ({
          flexGrow: 1,
          minWidth: 0,
          gap: RAIL_GUTTER,
          ...(interactive ? targetPaint(theme) : {}),
        })}
      >
        <Stack sx={{ flexGrow: 1, minWidth: 0 }}>{children}</Stack>
        {chevron}
      </Stack>
    </Stack>
  );
};
