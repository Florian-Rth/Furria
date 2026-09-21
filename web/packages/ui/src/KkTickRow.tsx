import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { focusRing } from './internal/focus-ring';
import { inkWashSurface } from './internal/ink-wash';
import { rowDividerTop } from './internal/row-divider';
import { KkEyebrow } from './KkEyebrow';
import { KkIcon } from './KkIcon';
import { KkMeta } from './KkMeta';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const BOX_SIZE = 24;
const BAR_WIDTH = 3;

const barShape = {
  width: BAR_WIDTH,
  alignSelf: 'stretch',
  borderRadius: `${kkTokens.radius.bar}px`,
  flexShrink: 0,
} as const;

interface KkTickRowProps {
  title: string;
  span: string;
  spanLabel?: string;
  meta?: string;
  chip?: ReactNode;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  dimmed?: boolean;
  sx?: KkSx;
}

export const KkTickRow: FC<KkTickRowProps> = ({
  title,
  span,
  spanLabel,
  meta,
  chip,
  checked,
  onToggle,
  disabled = false,
  dimmed = false,
  sx,
}) => {
  const titleColor = dimmed ? 'text.secondary' : 'text.primary';
  const rowOpacity = disabled ? kkTokens.opacity.dimmed : 1;
  const tick = checked ? <KkIcon name="check" size="small" /> : null;
  const metaLine = meta === undefined ? null : <KkMeta component="span">{meta}</KkMeta>;
  const chipSlot =
    chip === undefined || chip === null ? null : (
      <Box component="span" sx={{ display: 'inline-flex', flexShrink: 0 }}>
        {chip}
      </Box>
    );
  const spanUnit =
    spanLabel === undefined ? null : (
      <KkEyebrow tone="muted" size="small" sx={{ lineHeight: 1 }}>
        {spanLabel}
      </KkEyebrow>
    );

  return (
    <Stack
      component="button"
      type="button"
      role="checkbox"
      direction="row"
      aria-checked={checked}
      disabled={disabled}
      onClick={onToggle}
      data-kk-tick-row
      sx={[
        (theme) => ({
          width: '100%',
          minWidth: 0,
          minHeight: kkTokens.tapTarget,
          alignItems: 'stretch',
          gap: 1.5,
          m: 0,
          px: 0,
          py: { xs: 1, desktop: 1.25 },
          appearance: 'none',
          textAlign: 'left',
          color: 'inherit',
          backgroundColor: 'transparent',
          borderWidth: 0,
          cursor: disabled ? 'default' : 'pointer',
          opacity: rowOpacity,
          ...rowDividerTop,
          ...focusRing(theme),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        aria-hidden
        component="span"
        sx={(theme) => ({
          ...barShape,
          ...inkWashSurface(theme, '14%', '20%'),
        })}
      />
      <Box
        aria-hidden
        component="span"
        sx={(theme) => ({
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'center',
          width: BOX_SIZE,
          height: BOX_SIZE,
          flexShrink: 0,
          borderRadius: `${kkTokens.radius.bar}px`,
          borderWidth: kkTokens.line.hair,
          borderStyle: 'solid',
          borderColor: checked ? 'primary.main' : 'divider',
          color: checked ? (theme.vars ?? theme).palette.primary.contrastText : 'text.secondary',
          backgroundColor: checked ? (theme.vars ?? theme).palette.primary.main : 'transparent',
        })}
      >
        {tick}
      </Box>
      <Stack
        component="span"
        sx={{ flexGrow: 1, flexBasis: 0, minWidth: 0, alignSelf: 'center', gap: 0.375 }}
      >
        <Stack
          component="span"
          direction="row"
          sx={{
            alignItems: 'center',
            gap: 1,
            minWidth: 0,
            flexWrap: { xs: 'wrap', desktop: 'nowrap' },
          }}
        >
          <Typography
            component="span"
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
      <Stack
        component="span"
        sx={{ alignItems: 'flex-end', gap: 0.25, alignSelf: 'center', flexShrink: 0 }}
      >
        {spanUnit}
        <Typography
          component="span"
          sx={{
            fontFamily: kkTokens.font.display,
            fontWeight: kkTokens.font.displayWeight,
            fontSize: kkTokens.type.span,
            letterSpacing: kkTokens.type.tracking.display,
            lineHeight: 1.2,
            color: 'text.primary',
            whiteSpace: 'nowrap',
          }}
        >
          {span}
        </Typography>
      </Stack>
    </Stack>
  );
};
