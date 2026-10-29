import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { PresalePlaceView } from '@/features/events/presale-places-display';

interface PresalePlaceItemProps {
  place: PresalePlaceView;
}

export const PresalePlaceItem: FC<PresalePlaceItemProps> = ({ place }) => {
  const addressLine =
    place.address === null ? null : (
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {place.address}
      </Typography>
    );

  const hintLine =
    place.hint === null ? null : (
      <Typography variant="body2" sx={{ color: 'text.secondary', textWrap: 'pretty' }}>
        {place.hint}
      </Typography>
    );

  const openingHours =
    place.openingHours.length === 0 ? null : (
      <Stack component="dl" sx={{ gap: 0.5, m: 0, pt: 0.5 }}>
        {place.openingHours.map((line) => (
          <Stack key={line.days} direction="row" sx={{ gap: 2, alignItems: 'baseline' }}>
            <Typography
              variant="caption"
              component="dt"
              sx={{ fontWeight: 800, minWidth: '4.5rem' }}
            >
              {line.days}
            </Typography>
            <Typography variant="body2" component="dd" sx={{ m: 0 }}>
              {line.times}
            </Typography>
          </Stack>
        ))}
      </Stack>
    );

  return (
    <Stack component="li" sx={{ gap: 0.25 }}>
      <Typography variant="subtitle2" component="p" sx={{ fontWeight: 800 }}>
        {place.name}
      </Typography>
      {addressLine}
      {hintLine}
      {openingHours}
    </Stack>
  );
};
