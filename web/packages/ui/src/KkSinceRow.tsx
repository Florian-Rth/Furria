import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ElementType, FC, ReactNode, Ref } from 'react';
import { accentWash } from './internal/accent-wash';
import { focusRing } from './internal/focus-ring';
import { inkWashSurface } from './internal/ink-wash';
import { redInk } from './internal/red-ink';
import { rowDividerTop } from './internal/row-divider';
import type { KkIconName } from './KkIcon';
import { KkIcon } from './KkIcon';
import { KkMeta } from './KkMeta';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

type KkSinceRowTone = 'neutral' | 'accent';

const TILE_SIZE = 30;
const TILE_WASH_LIGHT = '8%';
const TILE_WASH_DARK = '14%';
const TITLE_UNDERLINE_OFFSET = '0.22em';

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

const hoverPaint = (theme: Theme): CSSObject => ({
  '@media (hover: hover)': {
    '&:hover': {
      '& [data-kk-since-row-title]': redInk(theme),
      '& [data-kk-since-row-chevron]': { color: 'text.primary' },
    },
  },
});

const titleHoverPaint = (theme: Theme): CSSObject => ({
  '@media (hover: hover)': {
    '&:hover': redInk(theme),
  },
});

const titleLinkPaint: CSSObject = {
  position: 'relative',
  textDecoration: 'underline',
  textDecorationThickness: kkTokens.line.hair,
  textUnderlineOffset: TITLE_UNDERLINE_OFFSET,
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: kkTokens.tapTarget,
    transform: 'translateY(-50%)',
  },
};

const highlightPaint = (theme: Theme): CSSObject => ({
  position: 'relative',
  isolation: 'isolate',
  '&::before': {
    content: '""',
    position: 'absolute',
    insetBlock: 0,
    insetInline: 0,
    zIndex: -1,
    pointerEvents: 'none',
    borderRadius: `${kkTokens.radius.bar}px`,
    ...accentWash(theme),
    animation: kkTokens.motion.rowHighlight,
    '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
  },
});

const overlayAnchor: CSSObject = { position: 'relative' };

const META_SEPARATOR = ' · ';
const WIDE_ONLY = { display: { xs: 'none', desktop: 'block' } } as const;
const COMPACT_ONLY = { display: { xs: 'block', desktop: 'none' } } as const;

interface KkSinceRowProps {
  icon?: KkIconName;
  avatar?: ReactNode;
  title: string;
  meta?: string;
  sinceLabel: string;
  sinceValue: string;
  tone?: KkSinceRowTone;
  trailing?: ReactNode;
  overlay?: ReactNode;
  dimmed?: boolean;
  highlight?: boolean;
  ref?: Ref<HTMLElement>;
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  search?: Record<string, string | number>;
  titleComponent?: ElementType;
  titleTo?: string;
  titleParams?: Record<string, string>;
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
  overlay,
  dimmed = false,
  highlight = false,
  ref,
  component,
  to,
  params,
  search,
  titleComponent,
  titleTo,
  titleParams,
  sx,
}) => {
  const interactive = component !== undefined;
  const titleInteractive = titleComponent !== undefined;
  const rowComponent = component ?? 'div';
  const routeProps = component === undefined ? {} : { to, params, search };
  const titleRouteProps = titleInteractive ? { to: titleTo, params: titleParams } : {};
  const titleColor = dimmed ? 'text.secondary' : 'text.primary';
  const leadingOpacity = dimmed ? kkTokens.opacity.dimmed : 1;
  const compactSince = `${sinceLabel} ${sinceValue}`;
  const compactMeta = meta === undefined ? compactSince : `${meta}${META_SEPARATOR}${compactSince}`;

  const titleElement = titleComponent ?? 'span';

  const wideMetaLine =
    meta === undefined ? null : (
      <KkMeta component="span" sx={WIDE_ONLY}>
        {meta}
      </KkMeta>
    );

  const compactMetaLine = (
    <KkMeta component="span" sx={COMPACT_ONLY}>
      {compactMeta}
    </KkMeta>
  );

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

  const showsChevron = interactive || (titleInteractive && trailingSlot === null);

  const chevron = showsChevron ? (
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
      ref={ref}
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
          ...(interactive ? hoverPaint(theme) : {}),
          ...(overlay === undefined ? {} : overlayAnchor),
          ...(highlight ? highlightPaint(theme) : {}),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {leading}
      <Stack component="span" sx={{ flexGrow: 1, minWidth: 0, gap: 0.25 }}>
        <Typography
          component={titleElement}
          {...titleRouteProps}
          data-kk-since-row-title
          sx={(theme) => ({
            display: 'block',
            alignSelf: 'flex-start',
            fontSize: kkTokens.type.rowValue,
            fontWeight: 800,
            lineHeight: 1.25,
            color: titleColor,
            minWidth: 0,
            overflowWrap: 'anywhere',
            textDecoration: 'none',
            cursor: titleInteractive ? 'pointer' : 'inherit',
            ...(titleInteractive ? titleLinkPaint : {}),
            ...(titleInteractive ? focusRing(theme) : {}),
            ...(titleInteractive ? titleHoverPaint(theme) : {}),
          })}
        >
          {title}
        </Typography>
        {wideMetaLine}
        {compactMetaLine}
      </Stack>
      <Typography
        component="span"
        data-kk-since-row-since
        sx={{
          display: { xs: 'none', desktop: 'block' },
          flexShrink: 0,
          fontSize: kkTokens.type.rowTitle,
          fontWeight: 800,
          letterSpacing: kkTokens.type.tracking.tight,
          lineHeight: 1.2,
          color: 'text.secondary',
          textAlign: 'right',
          whiteSpace: 'nowrap',
        }}
      >
        {compactSince}
      </Typography>
      {trailingSlot}
      {chevron}
      {overlay}
    </Stack>
  );
};
