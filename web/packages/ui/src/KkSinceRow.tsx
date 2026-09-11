import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { accentWash } from './internal/accent-wash';
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
const TILE_GUTTER = 5.25;
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

interface KkSinceRowProps {
  icon: KkIconName;
  title: string;
  meta?: string;
  sinceLabel: string;
  sinceValue: string;
  tone?: KkSinceRowTone;
  trailing?: ReactNode;
  dimmed?: boolean;
  sx?: KkSx;
}

export const KkSinceRow: FC<KkSinceRowProps> = ({
  icon,
  title,
  meta,
  sinceLabel,
  sinceValue,
  tone = 'neutral',
  trailing,
  dimmed = false,
  sx,
}) => {
  const metaLine = meta === undefined ? null : <KkMeta>{meta}</KkMeta>;

  const trailingRow =
    trailing === undefined || trailing === null ? null : (
      <Stack
        direction="row"
        data-kk-since-row-trailing
        sx={{
          alignItems: 'center',
          justifyContent: { xs: 'flex-end', desktop: 'flex-start' },
          gap: 0.75,
          flexShrink: 0,
          width: { xs: '100%', desktop: 'auto' },
          pl: { xs: TILE_GUTTER, desktop: 0 },
        }}
      >
        {trailing}
      </Stack>
    );

  return (
    <Stack
      direction="row"
      data-kk-since-row
      sx={[
        {
          alignItems: 'center',
          gap: 1.5,
          minWidth: 0,
          flexWrap: { xs: 'wrap', desktop: 'nowrap' },
          py: 1.5,
          opacity: dimmed ? kkTokens.opacity.dimmed : 1,
          ...rowDividerTop,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Stack
        aria-hidden
        sx={(theme) => ({
          width: TILE_SIZE,
          height: TILE_SIZE,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          flexShrink: 0,
          ...toneTile[tone](theme),
        })}
      >
        <KkIcon name={icon} size="small" />
      </Stack>
      <Stack sx={{ flexGrow: 1, minWidth: 0, gap: 0.25 }}>
        <Typography
          component="p"
          sx={{
            fontSize: kkTokens.type.rowTitle,
            fontWeight: 800,
            lineHeight: 1.25,
            color: 'text.primary',
          }}
        >
          {title}
        </Typography>
        {metaLine}
      </Stack>
      <Stack sx={{ alignItems: 'flex-end', gap: 0.25, flexShrink: 0 }}>
        <KkEyebrow tone="muted" size="small" sx={{ lineHeight: 1 }}>
          {sinceLabel}
        </KkEyebrow>
        <Typography
          component="p"
          sx={{
            fontFamily: kkTokens.font.display,
            fontWeight: kkTokens.font.displayWeight,
            fontSize: kkTokens.type.rowValue,
            letterSpacing: '0.02em',
            lineHeight: 1,
            color: 'text.primary',
            whiteSpace: 'nowrap',
          }}
        >
          {sinceValue}
        </Typography>
      </Stack>
      {trailingRow}
    </Stack>
  );
};
