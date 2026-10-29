import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { redInk } from '../internal/red-ink';
import { kkTokens } from '../tokens';
import { textArrivalOf } from './internal/logic/studio-f-motion';
import type { KkStudioFTurn } from './studio-f-types';

const TITLE_HEIGHT = '2rem';

interface KkStudioFTitleProps {
  number: string;
  name: string;
  part: string | null;
  turn: KkStudioFTurn;
}

export const KkStudioFTitle: FC<KkStudioFTitleProps> = ({ number, name, part, turn }) => {
  const partLine =
    part === null ? null : (
      <Typography
        component="span"
        sx={{
          typography: 'body2',
          fontWeight: 700,
          color: 'text.secondary',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {part}
      </Typography>
    );

  return (
    <Box
      data-kk-studio-f-title
      aria-live="polite"
      sx={{ position: 'relative', height: TITLE_HEIGHT, minWidth: 0 }}
    >
      <Stack
        key={turn.key}
        direction="row"
        sx={{
          position: 'absolute',
          inset: 0,
          alignItems: 'baseline',
          gap: 1,
          minWidth: 0,
          animation: textArrivalOf(turn.direction),
        }}
      >
        <Typography
          component="span"
          sx={(theme) => ({
            typography: 'h2',
            lineHeight: 1.1,
            fontVariantNumeric: 'tabular-nums',
            flexShrink: 0,
            ...redInk(theme),
          })}
        >
          {number}
        </Typography>
        <Typography
          component="h1"
          sx={{
            typography: 'h3',
            lineHeight: 1.1,
            letterSpacing: kkTokens.type.tracking.tight,
            minWidth: 0,
            flex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {name}
        </Typography>
        {partLine}
      </Stack>
    </Box>
  );
};
