import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const SCROLL_MARGIN = 148;
const STICKY_LAYER = 1;

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
        position: 'sticky',
        top: 0,
        zIndex: STICKY_LAYER,
        bgcolor: grounds[ground],
        pt: 1.75,
        pb: 0.5,
        scrollMarginTop: SCROLL_MARGIN,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <Typography
      component="p"
      sx={{
        fontFamily: kkTokens.font.display,
        fontWeight: kkTokens.font.displayWeight,
        fontSize: kkTokens.type.span,
        letterSpacing: '0.07em',
        lineHeight: 1,
        color: 'primary.main',
        flexShrink: 0,
      }}
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
