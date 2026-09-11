import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { raisedSurface } from './internal/raised-surface';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const ROW_BORDER = 1.5;
const BAR_WIDTH = 3;
const BAR_RADIUS = '3px';
const TITLE_SIZE = '1.0625rem';
const META_SIZE = '0.6875rem';

interface KkSelectRowProps {
  title: string;
  meta?: string;
  trailing?: ReactNode;
  selected?: boolean;
  onClick: () => void;
  sx?: KkSx;
}

export const KkSelectRow: FC<KkSelectRowProps> = ({
  title,
  meta,
  trailing,
  selected = false,
  onClick,
  sx,
}) => {
  const current = selected ? true : undefined;
  const titleColor = selected ? 'text.primary' : 'text.secondary';
  const barColor = selected ? 'primary.main' : 'transparent';
  const borderColor = selected ? 'text.primary' : 'transparent';

  const metaLine =
    meta === undefined ? null : (
      <Typography
        component="p"
        sx={{
          fontSize: META_SIZE,
          fontWeight: 600,
          lineHeight: 1.3,
          color: 'text.disabled',
          minWidth: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {meta}
      </Typography>
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
          backgroundColor: 'transparent',
          borderWidth: ROW_BORDER,
          borderStyle: 'solid',
          borderColor,
          borderRadius: `${kkTokens.radius.base}px`,
          ...(selected ? raisedSurface(theme) : {}),
          '@media (hover: hover)': {
            '&:hover': { '& [data-kk-select-row-title]': { color: 'text.primary' } },
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        aria-hidden
        sx={{
          width: BAR_WIDTH,
          alignSelf: 'stretch',
          borderRadius: BAR_RADIUS,
          backgroundColor: barColor,
          flexShrink: 0,
        }}
      />
      <Stack sx={{ flexGrow: 1, minWidth: 0, gap: 0.375 }}>
        <Typography
          component="p"
          data-kk-select-row-title
          sx={{
            fontFamily: kkTokens.font.display,
            fontSize: TITLE_SIZE,
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
