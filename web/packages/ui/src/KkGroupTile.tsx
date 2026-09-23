import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { ElementType, FC } from 'react';
import { focusRing } from './internal/focus-ring';
import type { KkGroupTone } from './internal/group-tone';
import { groupToneInkPaint } from './internal/group-tone';
import { lineClamp } from './internal/line-clamp';
import { redInk } from './internal/red-ink';
import { responsiveTypography } from './internal/responsive-typography';
import { KkAvatar } from './KkAvatar';
import { KkMeta } from './KkMeta';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const NAME_LINES = 2;
const NAME_LINE_HEIGHT = 1.2;
const NAME_TYPOGRAPHY = { xs: 'caption', desktop: 'body2' } as const;
const ACCENT_LINES = 2;

interface KkGroupTileProps {
  tone: KkGroupTone;
  initials: string;
  name: string;
  accent?: string;
  meta?: string;
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  onClick?: () => void;
  sx?: KkSx;
}

export const KkGroupTile: FC<KkGroupTileProps> = ({
  tone,
  initials,
  name,
  accent,
  meta,
  component,
  to,
  params,
  onClick,
  sx,
}) => {
  const interactive = component !== undefined || onClick !== undefined;
  const tileComponent = component ?? (onClick === undefined ? 'div' : 'button');
  const routeProps = component === undefined ? {} : { to, params };
  const nativeProps = tileComponent === 'button' ? { type: 'button' as const } : {};
  const isAccented = accent !== undefined;
  const metaLine = meta === undefined ? null : <KkMeta component="span">{meta}</KkMeta>;

  const accentLine = isAccented ? (
    <Box
      component="span"
      data-kk-group-tile-accent
      sx={(theme) => ({
        ...theme.typography.caption,
        fontWeight: 900,
        letterSpacing: kkTokens.type.tracking.label,
        lineHeight: 1.3,
        textTransform: 'uppercase',
        hyphens: 'auto',
        overflowWrap: 'anywhere',
        ...lineClamp(ACCENT_LINES),
        ...groupToneInkPaint(theme, tone),
      })}
    >
      {accent}
    </Box>
  ) : null;

  return (
    <Stack
      component={tileComponent}
      {...routeProps}
      {...nativeProps}
      onClick={onClick}
      data-kk-group-tile
      sx={[
        (theme) => ({
          minWidth: 0,
          alignItems: 'center',
          textAlign: 'center',
          gap: 0.75,
          appearance: 'none',
          background: 'none',
          border: 'none',
          padding: 0,
          color: 'inherit',
          textDecoration: 'none',
          cursor: interactive ? 'pointer' : 'default',
          ...focusRing(theme),
          '@media (hover: hover)': {
            '&:hover': {
              '& [data-kk-group-tile-name]': interactive ? redInk(theme) : {},
            },
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <KkAvatar
        initials={initials}
        size="large"
        component="span"
        tone={isAccented ? tone : undefined}
      />
      <Box
        component="span"
        data-kk-group-tile-name
        sx={(theme) => ({
          ...responsiveTypography(theme, NAME_TYPOGRAPHY, {
            fontWeight: 800,
            lineHeight: NAME_LINE_HEIGHT,
            letterSpacing: kkTokens.type.tracking.tight,
          }),
          color: 'text.primary',
          overflowWrap: 'anywhere',
          ...lineClamp(NAME_LINES),
        })}
      >
        {name}
      </Box>
      {accentLine}
      {metaLine}
    </Stack>
  );
};
