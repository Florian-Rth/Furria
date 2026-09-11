import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import { inkWash } from './internal/ink-wash';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

type KkFactRowTone = 'neutral' | 'gold' | 'accent';

const HAIRLINE = 1.5;
const BAR_WIDTH = 3;
const BAR_RADIUS = '3px';
const BAR_GUTTER = 1.875;
const NEUTRAL_BAR_WASH = '18%';
const NESTED_RAIL_OPACITY = 0.5;
const TITLE_SIZE = '0.84375rem';
const META_SIZE = '0.71875rem';
const SPAN_SIZE = '0.9375rem';

const toneBar: Record<KkFactRowTone, (theme: Theme) => string> = {
  neutral: (theme) => inkWash(theme, NEUTRAL_BAR_WASH),
  gold: (theme) => (theme.vars ?? theme).palette.warning.main,
  accent: (theme) => (theme.vars ?? theme).palette.primary.main,
};

interface KkFactRowProps extends PropsWithChildren {
  title: string;
  span: string;
  meta?: string;
  tone?: KkFactRowTone;
  chip?: ReactNode;
  actions?: ReactNode;
  sx?: KkSx;
}

export const KkFactRow: FC<KkFactRowProps> = ({
  title,
  span,
  meta,
  tone = 'neutral',
  chip,
  actions,
  sx,
  children,
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
        <Box
          aria-hidden
          sx={(theme) => ({
            width: BAR_WIDTH,
            alignSelf: 'stretch',
            borderRadius: BAR_RADIUS,
            backgroundColor: toneBar[tone](theme),
            opacity: NESTED_RAIL_OPACITY,
            flexShrink: 0,
          })}
        />
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
          borderTopWidth: HAIRLINE,
          borderTopStyle: 'solid',
          borderColor: 'divider',
          '&:first-of-type': { borderTopWidth: 0 },
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
          sx={(theme) => ({
            width: BAR_WIDTH,
            alignSelf: 'stretch',
            borderRadius: BAR_RADIUS,
            backgroundColor: toneBar[tone](theme),
            flexShrink: 0,
          })}
        />
        <Stack sx={{ flexGrow: 1, minWidth: 0, alignSelf: 'center', gap: 0.375 }}>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', gap: 1, minWidth: 0, flexWrap: 'wrap' }}
          >
            <Typography
              component="p"
              sx={{
                fontSize: TITLE_SIZE,
                fontWeight: 800,
                lineHeight: 1.25,
                color: 'text.primary',
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
            fontSize: SPAN_SIZE,
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
