import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ElementType, FC, ReactNode } from 'react';
import { focusRing } from './internal/focus-ring';
import { lineClamp } from './internal/line-clamp';
import { raisedSurface } from './internal/raised-surface';
import { redInk } from './internal/red-ink';
import { KkIcon } from './KkIcon';
import { KkMeta } from './KkMeta';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const BAR_WIDTH = 3;
const TITLE_LINES = 2;
const META_LINES = 2;

const clampedTitle = lineClamp(TITLE_LINES);
const clampedMeta = lineClamp(META_LINES);

interface KkSelectRowProps {
  title: string;
  meta?: string;
  trailing?: ReactNode;
  selected?: boolean;
  dimmed?: boolean;
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  search?: Record<string, string | number>;
  onClick?: () => void;
  sx?: KkSx;
}

export const KkSelectRow: FC<KkSelectRowProps> = ({
  title,
  meta,
  trailing,
  selected = false,
  dimmed = false,
  component,
  to,
  params,
  search,
  onClick,
  sx,
}) => {
  const current = selected ? true : undefined;
  const titleColor = dimmed ? 'text.secondary' : 'text.primary';
  const borderColor = selected ? 'text.primary' : 'transparent';
  const barScale = selected ? 1 : 0;
  const rowComponent = component ?? 'button';
  const routeProps = component === undefined ? {} : { to, params, search };
  const nativeProps = component === undefined ? { type: 'button' as const } : {};

  const metaLine =
    meta === undefined ? null : (
      <KkMeta component="span" sx={clampedMeta}>
        {meta}
      </KkMeta>
    );

  return (
    <Stack
      component={rowComponent}
      {...routeProps}
      {...nativeProps}
      direction="row"
      aria-current={current}
      onClick={onClick}
      data-kk-select-row
      sx={[
        (theme) => ({
          width: '100%',
          minWidth: 0,
          minHeight: kkTokens.tapTarget,
          alignItems: 'center',
          gap: 1.375,
          m: 0,
          py: 1.25,
          pr: 1.25,
          pl: 1.375,
          appearance: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          textDecoration: 'none',
          color: 'inherit',
          backgroundColor: 'transparent',
          borderWidth: kkTokens.line.hair,
          borderStyle: 'solid',
          borderColor,
          borderRadius: `${kkTokens.radius.base}px`,
          ...(selected ? raisedSurface(theme) : {}),
          ...focusRing(theme),
          '@media (hover: hover)': {
            '&:hover': {
              '& [data-kk-select-row-title]': redInk(theme),
              '& [data-kk-select-row-chevron]': { color: 'text.primary' },
            },
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        aria-hidden
        component="span"
        sx={{
          display: 'block',
          width: BAR_WIDTH,
          alignSelf: 'stretch',
          borderRadius: `${kkTokens.radius.bar}px`,
          backgroundColor: 'primary.main',
          transform: `scaleY(${barScale})`,
          transformOrigin: 'center',
          transition: kkTokens.motion.bar,
          flexShrink: 0,
        }}
      />
      <Stack component="span" sx={{ flexGrow: 1, minWidth: 0, gap: 0.375 }}>
        <Typography
          component="span"
          data-kk-select-row-title
          sx={{
            fontFamily: kkTokens.font.display,
            fontWeight: kkTokens.font.displayWeight,
            fontSize: kkTokens.type.rowValue,
            letterSpacing: kkTokens.type.tracking.display,
            lineHeight: 1.3,
            color: titleColor,
            minWidth: 0,
          }}
        >
          <Box component="span" sx={clampedTitle}>
            {title}
          </Box>
        </Typography>
        {metaLine}
      </Stack>
      {trailing}
      <Box
        component="span"
        data-kk-select-row-chevron
        sx={{ display: 'inline-flex', color: 'text.secondary', flexShrink: 0 }}
      >
        <KkIcon name="chevron" size="small" />
      </Box>
    </Stack>
  );
};
