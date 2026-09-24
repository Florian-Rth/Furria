import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ElementType, FC, PropsWithChildren, ReactNode } from 'react';
import { focusRing } from './internal/focus-ring';
import type { KkGroupTone } from './internal/group-tone';
import { groupToneEdgeScheme } from './internal/group-tone';
import { highlightMark, highlightPaint } from './internal/highlight-paint';
import { inkWashSurface } from './internal/ink-wash';
import { redInk } from './internal/red-ink';
import { rowDividerTop } from './internal/row-divider';
import { applyScheme, schemeFill } from './internal/scheme-paint';
import { KkEyebrow } from './KkEyebrow';
import { KkIcon } from './KkIcon';
import { KkMeta } from './KkMeta';
import type { KkLinkSearch } from './kk-link-search';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

type KkFactRowTone = 'neutral' | 'gold' | 'accent';

const BAR_WIDTH = 3;
const BAR_GUTTER = 1.875;
const GROUP_EDGE_GUTTER = 1.25;
const RAIL_MIX = '55%';
const ACTIONS_WIDTH = 168;

const softer = (color: string): string => `color-mix(in srgb, ${color} ${RAIL_MIX}, transparent)`;

const toneBar: Record<KkFactRowTone, (theme: Theme) => CSSObject> = {
  neutral: (theme) => inkWashSurface(theme, '22%', '30%'),
  gold: (theme) =>
    applyScheme(theme, schemeFill(kkTokens.color.light.gold, kkTokens.color.dark.gold)),
  accent: (theme) =>
    applyScheme(theme, schemeFill(kkTokens.color.light.red, kkTokens.color.dark.red)),
};

const toneRail: Record<KkFactRowTone, (theme: Theme) => CSSObject> = {
  neutral: (theme) => inkWashSurface(theme, '14%', '20%'),
  gold: (theme) =>
    applyScheme(
      theme,
      schemeFill(softer(kkTokens.color.light.gold), softer(kkTokens.color.dark.gold)),
    ),
  accent: (theme) =>
    applyScheme(
      theme,
      schemeFill(softer(kkTokens.color.light.red), softer(kkTokens.color.dark.red)),
    ),
};

const barShape: CSSObject = {
  width: BAR_WIDTH,
  alignSelf: 'stretch',
  borderRadius: `${kkTokens.radius.bar}px`,
  flexShrink: 0,
};

const groupEdgeShape: CSSObject = {
  width: 0,
  alignSelf: 'stretch',
  flexShrink: 0,
  borderLeftWidth: kkTokens.line.page,
  borderLeftStyle: 'solid',
  borderLeftColor: 'transparent',
};

const groupEdgePaint = (theme: Theme, tone: KkGroupTone | null): CSSObject => {
  if (tone === null) {
    return groupEdgeShape;
  }

  return { ...groupEdgeShape, ...applyScheme(theme, groupToneEdgeScheme(tone)) };
};

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
      '& [data-kk-fact-row-title]': redInk(theme),
      '& [data-kk-fact-row-chevron]': { color: 'text.primary' },
    },
  },
});

interface KkFactRowProps extends PropsWithChildren {
  title: string;
  span: string;
  spanLabel?: string;
  meta?: string;
  tone?: KkFactRowTone;
  groupTone?: KkGroupTone | null;
  chip?: ReactNode;
  actions?: ReactNode;
  dimmed?: boolean;
  highlight?: boolean;
  landing?: string;
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  search?: KkLinkSearch;
  sx?: KkSx;
}

export const KkFactRow: FC<KkFactRowProps> = ({
  title,
  span,
  spanLabel,
  meta,
  tone = 'neutral',
  groupTone,
  chip,
  actions,
  dimmed = false,
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
  const bodyComponent = component ?? 'div';
  const routeProps = interactive ? { to, params, search } : {};
  const highlightProps = highlightMark(highlight);
  const metaLine = meta === undefined ? null : <KkMeta>{meta}</KkMeta>;
  const chipSlot =
    chip === undefined || chip === null ? null : (
      <Box sx={{ display: 'inline-flex', flexShrink: 0 }}>{chip}</Box>
    );
  const titleColor = dimmed ? 'text.secondary' : 'text.primary';
  const barOpacity = dimmed ? kkTokens.opacity.dimmed : 1;

  const actionsRow =
    actions === undefined ? null : (
      <Stack
        direction="row"
        data-kk-fact-row-actions
        sx={{
          display: 'flex',
          alignItems: 'center',
          alignSelf: 'center',
          justifyContent: { xs: 'flex-start', desktop: 'flex-end' },
          gap: 0.75,
          flexShrink: 0,
          width: { xs: '100%', desktop: ACTIONS_WIDTH },
          minWidth: { desktop: ACTIONS_WIDTH },
          pl: { xs: BAR_GUTTER, desktop: 0 },
        }}
      >
        {actions}
      </Stack>
    );

  const insideActions = interactive ? null : actionsRow;
  const besideActions = interactive ? actionsRow : null;

  const chevron = interactive ? (
    <Box
      aria-hidden
      component="span"
      data-kk-fact-row-chevron
      sx={{
        display: 'inline-flex',
        alignSelf: 'center',
        color: 'text.secondary',
        flexShrink: 0,
      }}
    >
      <KkIcon name="chevron" size="small" />
    </Box>
  ) : null;

  const spanUnit =
    spanLabel === undefined ? null : (
      <KkEyebrow tone="muted" sx={{ lineHeight: 1 }}>
        {spanLabel}
      </KkEyebrow>
    );

  const spanBlock = (
    <Stack sx={{ alignItems: 'flex-end', gap: 0.25, alignSelf: 'center', flexShrink: 0 }}>
      {spanUnit}
      <Typography
        component="p"
        sx={{
          typography: 'h4',
          letterSpacing: kkTokens.type.tracking.display,
          lineHeight: 1.2,
          color: 'text.primary',
          whiteSpace: 'nowrap',
        }}
      >
        {span}
      </Typography>
    </Stack>
  );

  const nestedRows =
    children === undefined || children === null ? null : (
      <Stack
        direction="row"
        data-kk-fact-row-nested
        sx={{ gap: 1.5, minWidth: 0, mt: 1, pl: BAR_GUTTER }}
      >
        <Box aria-hidden sx={(theme) => ({ ...barShape, ...toneRail[tone](theme) })} />
        <Stack sx={{ flexGrow: 1, minWidth: 0 }}>{children}</Stack>
      </Stack>
    );

  const groupEdge =
    groupTone === undefined ? null : (
      <Box
        aria-hidden
        data-kk-fact-row-group-edge
        sx={(theme) => groupEdgePaint(theme, groupTone)}
      />
    );

  const mainRow = (
    <Stack
      direction="row"
      sx={{
        alignItems: 'stretch',
        gap: 1.5,
        minWidth: 0,
        flexWrap: { xs: 'wrap', desktop: 'nowrap' },
      }}
    >
      <Box
        aria-hidden
        sx={(theme) => ({ ...barShape, opacity: barOpacity, ...toneBar[tone](theme) })}
      />
      <Stack sx={{ flexGrow: 1, flexBasis: 0, minWidth: 0, alignSelf: 'center', gap: 0.375 }}>
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            gap: 1,
            minWidth: 0,
            flexWrap: { xs: 'wrap', desktop: 'nowrap' },
          }}
        >
          <Typography
            component="p"
            data-kk-fact-row-title
            sx={{
              typography: 'body2',
              fontWeight: 800,
              lineHeight: 1.25,
              color: titleColor,
              minWidth: 0,
              whiteSpace: { xs: 'normal', desktop: 'nowrap' },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </Typography>
          {chipSlot}
        </Stack>
        {metaLine}
      </Stack>
      {spanBlock}
      {chevron}
      {insideActions}
    </Stack>
  );

  return (
    <Stack
      direction="row"
      {...highlightProps}
      data-kk-fact-row
      data-kk-landing={landing}
      sx={[
        (theme) => ({
          minWidth: 0,
          gap: GROUP_EDGE_GUTTER,
          flexWrap: interactive ? 'wrap' : 'nowrap',
          py: { xs: 1, desktop: 1.5 },
          ...rowDividerTop,
          ...(highlight ? highlightPaint(theme) : {}),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {groupEdge}
      <Stack
        component={bodyComponent}
        {...routeProps}
        data-kk-fact-row-body
        sx={(theme) => ({
          flexGrow: 1,
          minWidth: 0,
          ...(interactive ? targetPaint(theme) : {}),
        })}
      >
        {mainRow}
        {nestedRows}
      </Stack>
      {besideActions}
    </Stack>
  );
};
