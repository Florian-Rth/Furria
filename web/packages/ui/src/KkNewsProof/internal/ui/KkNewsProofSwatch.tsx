import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkSx } from '../../../kk-sx';
import type { KkNewsProofFacts } from '../../news-proof-types';
import { newsPaintOf } from '../logic/news-paint';

interface KkNewsProofSwatchProps {
  facts: KkNewsProofFacts;
  sx?: KkSx;
}

export const KkNewsProofSwatch: FC<KkNewsProofSwatchProps> = ({ facts, sx }) => {
  const photo = facts.pictureSource === null ? 'none' : `url("${facts.pictureSource}")`;

  return (
    <Box
      aria-hidden
      sx={[
        (theme) => ({
          backgroundColor: newsPaintOf(theme, facts.categoryTone).fill,
          backgroundImage: photo,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
};
