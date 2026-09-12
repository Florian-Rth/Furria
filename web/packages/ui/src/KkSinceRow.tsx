import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ElementType, FC, ReactNode } from 'react';
import { accentWash } from './internal/accent-wash';
import { focusRing } from './internal/focus-ring';
import { inkWashSurface } from './internal/ink-wash';
import { rowDividerTop } from './internal/row-divider';
import { KkEyebrow } from './KkEyebrow';
import type { KkIconName } from './KkIcon';
import { KkIcon } from './KkIcon';
import { KkMeta } from './KkMeta';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

type KkSinceRowTone = 'neutral' | 'accent';

const TILE_SIZE = 30;
const TILE_WASH_LIGHT = '8%';
const TILE_WASH_DARK = '14%';

const toneTile: Record<KkSinceRowTone, (theme: Theme) => CSSObject> = {
  neutral: (theme) => ({
    ...inkWashSurface(theme, TILE_WASH_LIGHT, TILE_WASH_DARK),
    color: (theme.vars ?? theme).palette.text.secondary,
  }),
  accent: (theme) => ({
    ...accentWash(theme),
    color: (theme.vars ?? theme).palette.primary.main,
  }),
};

const hoverPaint: CSSObject = {
  '@media (hover: hover)': {
    '&:hover': {
      '& [data-kk-since-row-title]': { color: 'primary.main' },
      '& [data-kk-since-row-chevron]': { color: 'text.primary' },
    },
  },
};

interface KkSinceRowProps {
  icon?: KkIconName;
  avatar?: ReactNode;
  title: string;
  meta?: string;
  sinceLabel: string;
  sinceValue: string;
  tone?: KkSinceRowTone;
  trailing?: ReactNode;
  dimmed?: boolean;
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  search?: Record<string, string | number>;
  sx?: KkSx;
}

export const KkSinceRow: FC<KkSinceRowProps> = ({
  icon,
  avatar,
  title,
  meta,
  sinceLabel,
  sinceValue,
  tone = 'neutral',
  trailing,
  dimmed = false,
  component,
  to,
  params,
  search,
  sx,
}) => {
  const interactive = component !== undefined;
  const rowComponent = component ?? 'div';
  const routeProps = component === undefined ? {} : { to, params, search };
  const titleColor = dimmed ? 'text.secondary' : 'text.primary';
  const leadingOpacity = dimmed ? kkTokens.opacity.dimmed : 1;

  const metaLine = meta === undefined ? null : <KkMeta component="span">{meta}</KkMeta>;

  const iconTile =
    icon === undefined ? null : (
      <Stack
        aria-hidden
        component="span"
        sx={(theme) => ({
          width: TILE_SIZE,
          height: TILE_SIZE,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          flexShrink: 0,
          opacity: leadingOpacity,
          ...toneTile[tone](theme),
        })}
      >
        <KkIcon name={icon} size="small" />
      </Stack>
    );

  const leading =
    avatar === undefined ? (
      iconTile
    ) : (
      <Box component="span" sx={{ display: 'inline-flex', flexShrink: 0, opacity: leadingOpacity }}>
        {avatar}
      </Box>
    );

  const trailingSlot =
    trailing === undefined || trailing === null ? null : (
      <Stack
        component="span"
        direction="row"
        data-kk-since-row-trailing
        sx={{ alignItems: 'center', gap: 0.75, flexShrink: 0 }}
      >
        {trailing}
      </Stack>
    );

  const chevron = interactive ? (
    <Box
      component="span"
      data-kk-since-row-chevron
      sx={{ display: 'inline-flex', color: 'text.secondary', flexShrink: 0 }}
    >
      <KkIcon name="chevron" size="small" />
    </Box>
  ) : null;

  return (
    <Stack
      component={rowComponent}
      {...routeProps}
      direction="row"
      data-kk-since-row
      sx={[
        (theme) => ({
          width: '100%',
          alignItems: 'center',
          gap: { xs: 1.125, desktop: 1.5 },
          minWidth: 0,
          flexWrap: 'nowrap',
          m: 0,
          px: 0,
          py: 1.5,
          appearance: 'none',
          backgroundColor: 'transparent',
          color: 'inherit',
          textAlign: 'left',
          textDecoration: 'none',
          borderWidth: 0,
          borderStyle: 'solid',
          cursor: interactive ? 'pointer' : 'default',
          ...rowDividerTop,
          ...focusRing(theme),
          ...(interactive ? hoverPaint : {}),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {leading}
      <Stack component="span" sx={{ flexGrow: 1, minWidth: 0, gap: 0.25 }}>
        <Typography
          component="span"
          data-kk-since-row-title
          sx={{
            display: 'block',
            fontSize: kkTokens.type.rowValue,
            fontWeight: 800,
            lineHeight: 1.25,
            color: titleColor,
            minWidth: 0,
            overflowWrap: 'anywhere',
          }}
        >
          {title}
        </Typography>
        {metaLine}
      </Stack>
      <Stack component="span" sx={{ alignItems: 'flex-end', gap: 0.25, flexShrink: 0 }}>
        <KkEyebrow tone="muted" size="small" sx={{ lineHeight: 1 }}>
          {sinceLabel}
        </KkEyebrow>
        <Typography
          component="span"
          sx={{
            display: 'block',
            fontSize: kkTokens.type.rowTitle,
            fontWeight: 800,
            letterSpacing: '0.01em',
            lineHeight: 1.2,
            color: 'text.secondary',
            whiteSpace: 'nowrap',
          }}
        >
          {sinceValue}
        </Typography>
      </Stack>
      {trailingSlot}
      {chevron}
    </Stack>
  );
};
