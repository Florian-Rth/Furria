import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkEyebrow } from '../../../KkEyebrow';
import { onFootage } from '../player-paint';

interface KkStudioDPlayerTitleProps {
  eyebrow: string | null;
  title: string;
}

export const KkStudioDPlayerTitle: FC<KkStudioDPlayerTitleProps> = ({ eyebrow, title }) => {
  const kicker =
    eyebrow === null ? null : (
      <KkEyebrow tone="muted" sx={{ lineHeight: 1.2, ...onFootage }}>
        {eyebrow}
      </KkEyebrow>
    );

  return (
    <Stack sx={{ minWidth: 0 }}>
      {kicker}
      <Typography
        variant="subtitle2"
        noWrap
        component="h1"
        sx={{ fontWeight: 800, lineHeight: 1.25, ...onFootage }}
      >
        {title}
      </Typography>
    </Stack>
  );
};
