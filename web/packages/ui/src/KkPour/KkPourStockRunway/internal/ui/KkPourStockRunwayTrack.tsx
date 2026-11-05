import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkPourRunway } from '../../../pour-stock-runway';

interface KkPourStockRunwayTrackProps {
  runway: KkPourRunway;
}

const percentOf = (share: number): string => `${share * 100}%`;

export const KkPourStockRunwayTrack: FC<KkPourStockRunwayTrackProps> = ({ runway }) => {
  const fillWidth = percentOf(runway.fill);
  const notches = runway.weeks.map((week) => {
    const left = percentOf(week);

    return <Box key={week} data-runway-notch sx={{ left }} />;
  });
  const fill =
    runway.reach === 'still' ? null : (
      <Box data-runway-fill data-reach={runway.reach} sx={{ width: fillWidth }} />
    );
  const marker =
    runway.reach === 'within' ? <Box data-runway-marker sx={{ left: fillWidth }} /> : null;

  return (
    <Box data-runway-track data-reach={runway.reach}>
      {fill}
      {notches}
      {marker}
    </Box>
  );
};
