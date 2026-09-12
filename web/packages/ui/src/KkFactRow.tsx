import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import { inkWashSurface } from './internal/ink-wash';
import { rowDividerTop } from './internal/row-divider';
import { applyScheme, schemeFill } from './internal/scheme-paint';
import { KkEyebrow } from './KkEyebrow';
import { KkMeta } from './KkMeta';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

type KkFactRowTone = 'neutral' | 'gold' | 'accent';

const BAR_WIDTH = 3;
const BAR_GUTTER = 1.875;
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

interface KkFactRowProps extends PropsWithChildren {
  title: string;
  span: string;
  spanLabel?: string;
  meta?: string;
  tone?: KkFactRowTone;
  chip?: ReactNode;
  actions?: ReactNode;
  dimmed?: boolean;
  sx?: KkSx;
}

export const KkFactRow: FC<KkFactRowProps> = ({
  title,
  span,
  spanLabel,
  meta,
  tone = 'neutral',
  chip,
  actions,
  dimmed = false,
  sx,
  children,
}) => {
  const metaLine = meta === undefined ? null : <KkMeta>{meta}</KkMeta>;
  const chipSlot =
    chip === undefined || chip === null ? null : (
      <Box sx={{ display: 'inline-flex', flexShrink: 0 }}>{chip}</Box>
    );
  const titleColor = dimmed ? 'text.secondary' : 'text.primary';
  const barOpacity = dimmed ? kkTokens.opacity.dimmed : 1;

  const compactActionsDisplay = actions === undefined ? 'none' : 'flex';

  const actionsRow = (
    <Stack
      direction="row"
      data-kk-fact-row-actions
      sx={{
        display: { xs: compactActionsDisplay, desktop: 'flex' },
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

  const spanUnit =
    spanLabel === undefined ? null : (
      <KkEyebrow tone="muted" size="small" sx={{ lineHeight: 1 }}>
        {spanLabel}
      </KkEyebrow>
    );

  const spanBlock = (
    <Stack sx={{ alignItems: 'flex-end', gap: 0.25, alignSelf: 'center', flexShrink: 0 }}>
      {spanUnit}
      <Typography
        component="p"
        sx={{
          fontFamily: kkTokens.font.display,
          fontWeight: kkTokens.font.displayWeight,
          fontSize: kkTokens.type.span,
          letterSpacing: '0.03em',
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
    children === undefined ? null : (
      <Stack
        direction="row"
        data-kk-fact-row-nested
        sx={{ gap: 1.5, minWidth: 0, mt: 1, pl: BAR_GUTTER }}
      >
        <Box aria-hidden sx={(theme) => ({ ...barShape, ...toneRail[tone](theme) })} />
        <Stack sx={{ flexGrow: 1, minWidth: 0 }}>{children}</Stack>
      </Stack>
    );

  return (
    <Stack
      data-kk-fact-row
      sx={[
        {
          minWidth: 0,
          py: { xs: 1, desktop: 1.5 },
          ...rowDividerTop,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
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
        <Stack sx={{ flexGrow: 1, minWidth: 0, alignSelf: 'center', gap: 0.375 }}>
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
              sx={{
                fontSize: kkTokens.type.rowTitle,
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
        {actionsRow}
      </Stack>
      {nestedRows}
    </Stack>
  );
};
