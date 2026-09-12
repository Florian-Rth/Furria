import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { redInk } from './internal/red-ink';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';
import { STICKY_BAR_HEIGHT_VARIABLE } from './use-sticky-bar-height';

const BAR_CLEARANCE = `var(${STICKY_BAR_HEIGHT_VARIABLE}, ${kkTokens.layout.stickyBarHeight}px)`;

type KkLetterDividerGround = 'paper' | 'page';

const grounds: Record<KkLetterDividerGround, string> = {
  paper: 'background.paper',
  page: 'background.default',
};

interface KkLetterDividerProps {
  letter: string;
  id?: string;
  ground?: KkLetterDividerGround;
  sx?: KkSx;
}

export const KkLetterDivider: FC<KkLetterDividerProps> = ({ letter, id, ground = 'paper', sx }) => (
  <Stack
    id={id}
    direction="row"
    data-kk-letter-divider
    sx={[
      {
        alignItems: 'center',
        gap: 1,
        minWidth: 0,
        bgcolor: grounds[ground],
        pt: 1.75,
        pb: 0.5,
        scrollMarginTop: BAR_CLEARANCE,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <Typography
      component="p"
      sx={(theme) => ({
        fontFamily: kkTokens.font.display,
        fontWeight: kkTokens.font.displayWeight,
        fontSize: kkTokens.type.span,
        letterSpacing: '0.07em',
        lineHeight: 1,
        ...redInk(theme),
        flexShrink: 0,
      })}
    >
      {letter}
    </Typography>
    <Box
      aria-hidden
      sx={{
        flexGrow: 1,
        minWidth: 0,
        borderBottomWidth: kkTokens.line.hair,
        borderBottomStyle: 'solid',
        borderColor: 'divider',
      }}
    />
  </Stack>
);
