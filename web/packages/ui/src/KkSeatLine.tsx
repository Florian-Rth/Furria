import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, ReactNode } from 'react';
import { goldInkOf } from './internal/gold-ink';
import type { KkHonours } from './internal/honours/honour-types';
import { KkAvatar } from './KkAvatar/KkAvatar';
import { stepFigures } from './KkStatePill/state-paint';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export type KkSeatTone = 'ink' | 'attention' | 'planned' | 'past';

const periodInk = (theme: Theme, tone: KkSeatTone): CSSObject => {
  switch (tone) {
    case 'attention':
      return goldInkOf(theme);
    case 'ink':
    case 'planned':
      return { color: 'text.secondary' };
    case 'past':
      return { color: 'text.disabled' };
  }
};

interface KkSeatLineProps {
  initials: string;
  honours?: KkHonours;
  name: string;
  period: string;
  tone?: KkSeatTone;
  action?: ReactNode;
  sx?: KkSx;
}

export const KkSeatLine: FC<KkSeatLineProps> = ({
  initials,
  honours,
  name,
  period,
  tone = 'ink',
  action,
  sx,
}) => {
  const isPast = tone === 'past';
  const avatar = isPast ? (
    <KkAvatar initials={initials} size="small" component="span" />
  ) : (
    <KkAvatar initials={initials} honours={honours} size="bar" component="span" />
  );
  const actionSlot =
    action === undefined || action === null ? null : (
      <Stack direction="row" sx={{ flexShrink: 0, alignItems: 'center', gap: 0.5 }}>
        {action}
      </Stack>
    );

  return (
    <Stack
      direction="row"
      component="li"
      data-kk-seat-line={tone}
      sx={[
        {
          alignItems: 'center',
          gap: 1.25,
          minWidth: 0,
          minHeight: kkTokens.tapTarget,
          py: 0.5,
          borderTopWidth: kkTokens.line.hair,
          borderTopStyle: 'solid',
          borderColor: 'divider',
          '&:first-of-type': { borderTopWidth: 0 },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          flexShrink: 0,
          opacity: isPast ? kkTokens.opacity.dimmed : 1,
        }}
      >
        {avatar}
      </Box>
      <Stack component="span" sx={{ flex: 1, minWidth: 0, gap: 0 }}>
        <Box
          component="span"
          sx={{
            typography: 'body2',
            fontWeight: isPast ? 600 : 800,
            lineHeight: 1.3,
            color: isPast ? 'text.secondary' : 'text.primary',
            overflowWrap: 'anywhere',
          }}
        >
          {name}
        </Box>
        <Box
          component="span"
          sx={(theme) => ({
            ...stepFigures,
            typography: 'caption',
            fontWeight: 700,
            lineHeight: 1.3,
            ...periodInk(theme, tone),
          })}
        >
          {period}
        </Box>
      </Stack>
      {actionSlot}
    </Stack>
  );
};
