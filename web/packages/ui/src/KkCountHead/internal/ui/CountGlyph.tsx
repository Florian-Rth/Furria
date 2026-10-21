import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import type { CountInk } from '../count-paint';
import { countFaceOf } from '../count-paint';

interface CountGlyphProps extends PropsWithChildren {
  ink: CountInk;
}

export const CountGlyph: FC<CountGlyphProps> = ({ ink, children }) => (
  <Typography component="span" sx={countFaceOf(ink)}>
    {children}
  </Typography>
);
