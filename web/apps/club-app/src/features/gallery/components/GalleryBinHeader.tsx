import { KkFilmEdge } from '@furria/ui/KkFilmEdge';
import { KkFlapCount } from '@furria/ui/KkFlapCount';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

const WORD = 'AUSSCHUSS';

interface GalleryBinHeaderProps {
  summary: string;
}

export const GalleryBinHeader: FC<GalleryBinHeaderProps> = ({ summary }) => (
  <Stack sx={{ rowGap: 0.5, minWidth: 0 }}>
    <KkFlapCount value={WORD} variant="h2" tone="red" />
    <KkFilmEdge lead={summary} tone="red" level="h2" sprockets />
  </Stack>
);
