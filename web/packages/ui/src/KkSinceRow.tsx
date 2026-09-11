import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { accentWash } from './internal/accent-wash';
import { inkWash } from './internal/ink-wash';
import { KkEyebrow } from './KkEyebrow';
import type { KkIconName } from './KkIcon';
import { KkIcon } from './KkIcon';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

type KkSinceRowTone = 'neutral' | 'accent';

const HAIRLINE = 1.5;
const TILE_SIZE = 30;
const TILE_WASH = '5%';
const DEFAULT_SINCE_LABEL = 'seit';
const TITLE_SIZE = '0.875rem';
const META_SIZE = '0.71875rem';
const SINCE_LABEL_SIZE = '0.5625rem';
const SINCE_VALUE_SIZE = '1.0625rem';

const toneTile: Record<KkSinceRowTone, (theme: Theme) => CSSObject> = {
  neutral: (theme) => ({
    backgroundColor: inkWash(theme, TILE_WASH),
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
  sinceLabel?: string;
  sinceValue: string;
  tone?: KkSinceRowTone;
  trailing?: ReactNode;
  sx?: KkSx;
}

export const KkSinceRow: FC<KkSinceRowProps> = ({
  icon,
  title,
  meta,
  sinceLabel = DEFAULT_SINCE_LABEL,
  sinceValue,
  tone = 'neutral',
  trailing,
  sx,
}) => {
  const metaLine =
    meta === undefined ? null : (
      <Typography
        component="p"
        sx={{ fontSize: META_SIZE, fontWeight: 600, lineHeight: 1.3, color: 'text.disabled' }}
      >
        {meta}
      </Typography>
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
          py: 1.5,
          borderTopWidth: HAIRLINE,
          borderTopStyle: 'solid',
          borderColor: 'divider',
          '&:first-of-type': { borderTopWidth: 0 },
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
          sx={{ fontSize: TITLE_SIZE, fontWeight: 800, lineHeight: 1.25, color: 'text.primary' }}
        >
          {title}
        </Typography>
        {metaLine}
      </Stack>
      <Stack sx={{ alignItems: 'flex-end', gap: 0.25, flexShrink: 0 }}>
        <KkEyebrow tone="muted" sx={{ fontSize: SINCE_LABEL_SIZE, lineHeight: 1 }}>
          {sinceLabel}
        </KkEyebrow>
        <Typography
          component="p"
          sx={{
            fontFamily: kkTokens.font.display,
            fontSize: SINCE_VALUE_SIZE,
            letterSpacing: '0.02em',
            lineHeight: 1,
            color: 'text.primary',
            whiteSpace: 'nowrap',
          }}
        >
          {sinceValue}
        </Typography>
      </Stack>
      {trailing}
    </Stack>
  );
};
