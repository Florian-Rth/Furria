import { KkConfettiBurst, KkFilmEdge, KkFlapCount } from '@furria/ui';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

const HUNG_WORD = 'AUSGEHÄNGT';
const CASE_WORD = 'SCHAUKASTEN';
const BURST_PIECES = 34;

interface AlbumSelectionMarqueeProps {
  isPublished: boolean;
  hangKey: number;
  lead: string;
  meta: string;
}

export const AlbumSelectionMarquee: FC<AlbumSelectionMarqueeProps> = ({
  isPublished,
  hangKey,
  lead,
  meta,
}) => {
  const word = isPublished ? HUNG_WORD : CASE_WORD;
  const tone = isPublished ? 'gold' : 'ink';

  return (
    <Stack sx={{ rowGap: 0.5, minWidth: 0 }}>
      <Box sx={{ position: 'relative', alignSelf: 'flex-start' }}>
        <KkFlapCount value={word} variant="h2" tone={tone} replayKey={hangKey} />
        <KkConfettiBurst fireKey={hangKey} count={BURST_PIECES} />
      </Box>
      <KkFilmEdge lead={lead} meta={meta} tone="gold" level="h2" sprockets />
    </Stack>
  );
};
