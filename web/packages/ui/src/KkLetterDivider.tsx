import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from './tokens';

const HAIRLINE = 1.5;
const LETTER_SIZE = '0.9375rem';
const SCROLL_MARGIN = 80;

interface KkLetterDividerProps {
  letter: string;
  id?: string;
}

export const KkLetterDivider: FC<KkLetterDividerProps> = ({ letter, id }) => (
  <Stack
    id={id}
    direction="row"
    data-kk-letter-divider
    sx={{
      alignItems: 'center',
      gap: 1,
      minWidth: 0,
      pt: 1.75,
      pb: 0.5,
      scrollMarginTop: SCROLL_MARGIN,
    }}
  >
    <Typography
      component="p"
      sx={{
        fontFamily: kkTokens.font.display,
        fontSize: LETTER_SIZE,
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
        borderBottomWidth: HAIRLINE,
        borderBottomStyle: 'solid',
        borderColor: 'divider',
      }}
    />
  </Stack>
);
