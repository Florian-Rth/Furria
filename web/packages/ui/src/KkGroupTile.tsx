import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { ElementType, FC } from 'react';
import { focusRing } from './internal/focus-ring';
import type { KkGroupTone } from './internal/group-tone';
import { groupToneEdgeScheme } from './internal/group-tone';
import { lineClamp } from './internal/line-clamp';
import { redInk } from './internal/red-ink';
import { applyScheme } from './internal/scheme-paint';
import { KkAvatar } from './KkAvatar';
import { KkMeta } from './KkMeta';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const RING_PADDING = 3;
const RING_WIDTH = kkTokens.line.section;
const RING_MAX_WIDTH = 72;
const AVATAR_FONT_SIZE = 'clamp(0.875rem, 4.4vw, 1.5rem)';
const NAME_LINES = 2;
const NAME_LINE_HEIGHT = 1.2;
const NAME_SIZE = { xs: kkTokens.type.rowMeta, desktop: kkTokens.type.rowTitle };

interface KkGroupTileProps {
  tone: KkGroupTone;
  initials: string;
  name: string;
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
  const metaLine = meta === undefined ? null : <KkMeta component="span">{meta}</KkMeta>;

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
      <Box
        aria-hidden
        sx={(theme) => ({
          display: 'inline-flex',
          width: '100%',
          maxWidth: RING_MAX_WIDTH,
          aspectRatio: '1 / 1',
          borderRadius: '50%',
          borderWidth: RING_WIDTH,
          borderStyle: 'solid',
          padding: `${RING_PADDING}px`,
          ...applyScheme(theme, groupToneEdgeScheme(tone)),
        })}
      >
        <KkAvatar
          initials={initials}
          size="large"
          component="span"
          sx={{ width: '100%', height: '100%', fontSize: AVATAR_FONT_SIZE }}
        />
      </Box>
      <Box
        component="span"
        data-kk-group-tile-name
        sx={{
          fontFamily: kkTokens.font.body,
          fontSize: NAME_SIZE,
          fontWeight: 800,
          lineHeight: NAME_LINE_HEIGHT,
          letterSpacing: kkTokens.type.tracking.tight,
          color: 'text.primary',
          overflowWrap: 'anywhere',
          ...lineClamp(NAME_LINES),
        }}
      >
        {name}
      </Box>
      {metaLine}
    </Stack>
  );
};
