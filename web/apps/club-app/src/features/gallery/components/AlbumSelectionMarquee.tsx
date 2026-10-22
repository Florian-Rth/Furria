import { KkFilmEdge } from '@furria/ui/KkFilmEdge';
import { KkFlapCount } from '@furria/ui/KkFlapCount';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

const HUNG_WORD = 'AUSGEHÄNGT';
const CASE_WORD = 'SCHAUKASTEN';

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
      <KkFlapCount
        value={word}
        variant="h2"
        tone={tone}
        replayKey={hangKey}
        sx={{ alignSelf: 'flex-start' }}
      />
      <KkFilmEdge lead={lead} meta={meta} tone="gold" level="h2" sprockets />
    </Stack>
  );
};
