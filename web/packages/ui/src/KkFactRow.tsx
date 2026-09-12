import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import { inkWashSurface } from './internal/ink-wash';
import { rowDividerTop } from './internal/row-divider';
import { applyScheme, schemeFill } from './internal/scheme-paint';
import { KkMeta } from './KkMeta';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

type KkFactRowTone = 'neutral' | 'gold' | 'accent';

const BAR_WIDTH = 3;
const BAR_GUTTER = 1.875;
const RAIL_MIX = '55%';

const softer = (color: string): string => `color-mix(in srgb, ${color} ${RAIL_MIX}, transparent)`;

const toneBar: Record<KkFactRowTone, (theme: Theme) => CSSObject> = {
  neutral: (theme) => inkWashSurface(theme, '22%', '30%'),
  gold: (theme) =>
    applyScheme(theme, schemeFill(kkTokens.color.light.goldInk, kkTokens.color.dark.goldInk)),
  accent: (theme) =>
    applyScheme(theme, schemeFill(kkTokens.color.light.redInk, kkTokens.color.dark.redInk)),
};

const toneRail: Record<KkFactRowTone, (theme: Theme) => CSSObject> = {
  neutral: (theme) => inkWashSurface(theme, '14%', '20%'),
  gold: (theme) =>
    applyScheme(
      theme,
      schemeFill(softer(kkTokens.color.light.goldInk), softer(kkTokens.color.dark.goldInk)),
    ),
  accent: (theme) =>
    applyScheme(
      theme,
      schemeFill(softer(kkTokens.color.light.redInk), softer(kkTokens.color.dark.redInk)),
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
  meta,
  tone = 'neutral',
  chip,
  actions,
  dimmed = false,
  sx,
  children,
}) => {
  const metaLine = meta === undefined ? null : <KkMeta>{meta}</KkMeta>;
  const titleColor = dimmed ? 'text.secondary' : 'text.primary';
  const barOpacity = dimmed ? kkTokens.opacity.dimmed : 1;

  const actionsRow =
    actions === undefined ? null : (
      <Stack
        direction="row"
        data-kk-fact-row-actions
        sx={{
          alignItems: 'center',
          alignSelf: 'center',
          gap: 0.75,
          flexShrink: 0,
          width: { xs: '100%', desktop: 'auto' },
          pl: { xs: BAR_GUTTER, desktop: 0 },
        }}
      >
        {actions}
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
          py: 1.5,
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
            sx={{ alignItems: 'center', gap: 1, minWidth: 0, flexWrap: 'wrap' }}
          >
            <Typography
              component="p"
              sx={{
                fontSize: kkTokens.type.rowTitle,
                fontWeight: 800,
                lineHeight: 1.25,
                color: titleColor,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
            </Typography>
            {chip}
          </Stack>
          {metaLine}
        </Stack>
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
            alignSelf: 'center',
            flexShrink: 0,
          }}
        >
          {span}
        </Typography>
        {actionsRow}
      </Stack>
      {nestedRows}
    </Stack>
  );
};
