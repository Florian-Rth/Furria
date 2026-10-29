import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { PresalePlaceView } from '@/features/events/presale-places-display';
import { PresalePlaceItem } from './PresalePlaceItem';

interface PresalePlaceListProps {
  places: PresalePlaceView[];
}

export const PresalePlaceList: FC<PresalePlaceListProps> = ({ places }) => (
  <Stack component="ul" sx={{ gap: 2, m: 0, p: 0, listStyle: 'none' }}>
    {places.map((place) => (
      <PresalePlaceItem key={place.name} place={place} />
    ))}
  </Stack>
);
