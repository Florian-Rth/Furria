import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkHallNumeralTone } from './KkHallNumeral';
import { KkHallNumeral } from './KkHallNumeral';

const NO_COUNT = '–';

const toneOf = (count: number | null, leading: boolean): KkHallNumeralTone => {
  if (count === null) {
    return 'rest';
  }

  return leading ? 'lead' : 'music';
};

interface KkHallCountProps {
  count: number | null;
  leading: boolean;
  label: string;
}

export const KkHallCount: FC<KkHallCountProps> = ({ count, leading, label }) => {
  const text = count === null ? NO_COUNT : String(count);
  const tone = toneOf(count, leading);

  return (
    <Box role="img" aria-label={label} sx={{ width: '100%', height: '100%' }}>
      <KkHallNumeral text={text} tone={tone} />
    </Box>
  );
};
