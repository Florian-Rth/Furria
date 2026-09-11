import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { focusRing } from './internal/focus-ring';
import { raisedSurface } from './internal/raised-surface';
import { KkMeta } from './KkMeta';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const BAR_WIDTH = 3;

interface KkSelectRowProps {
  title: string;
  meta?: string;
  trailing?: ReactNode;
  selected?: boolean;
  dimmed?: boolean;
  onClick: () => void;
  sx?: KkSx;
}

export const KkSelectRow: FC<KkSelectRowProps> = ({
  title,
  meta,
  trailing,
  selected = false,
  dimmed = false,
  onClick,
  sx,
}) => {
  const current = selected ? true : undefined;
  const titleColor = selected ? 'text.primary' : 'text.secondary';
  const borderColor = selected ? 'text.primary' : 'transparent';
  const barScale = selected ? 1 : 0;

  const metaLine =
    meta === undefined ? null : (
      <KkMeta
        component="span"
        sx={{
          display: 'block',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {meta}
      </KkMeta>
    );

  return (
    <Stack
      component="button"
      type="button"
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
          pr: 1.5,
          pl: 1.375,
          appearance: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          color: 'inherit',
          opacity: dimmed ? kkTokens.opacity.dimmed : 1,
          backgroundColor: 'transparent',
          borderWidth: kkTokens.line.hair,
          borderStyle: 'solid',
          borderColor,
          borderRadius: `${kkTokens.radius.base}px`,
          ...(selected ? raisedSurface(theme) : {}),
          ...focusRing(theme),
          '@media (hover: hover)': {
            '&:hover': { '& [data-kk-select-row-title]': { color: 'text.primary' } },
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
            display: 'block',
            fontFamily: kkTokens.font.display,
            fontWeight: kkTokens.font.displayWeight,
            fontSize: kkTokens.type.rowValue,
            letterSpacing: '0.025em',
            lineHeight: 1.1,
            color: titleColor,
            textTransform: 'uppercase',
            minWidth: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </Typography>
        {metaLine}
      </Stack>
      {trailing}
    </Stack>
  );
};
