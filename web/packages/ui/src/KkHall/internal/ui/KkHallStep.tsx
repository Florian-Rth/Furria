import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkHallStepProps {
  name: string;
  meta: string | null;
  next: string | null;
}

export const KkHallStep: FC<KkHallStepProps> = ({ name, meta, next }) => {
  const metaLine =
    meta === null ? null : (
      <Typography variant="overline" component="p" sx={{ color: 'text.secondary' }} noWrap>
        {meta}
      </Typography>
    );
  const nextLine =
    next === null ? null : (
      <Typography variant="body1" component="p" sx={{ color: 'text.secondary' }} noWrap>
        {next}
      </Typography>
    );

  return (
    <Stack sx={{ minWidth: 0, gap: 0.25, width: '100%' }}>
      {metaLine}
      <Typography variant="h1" component="p" aria-live="polite" noWrap>
        {name}
      </Typography>
      {nextLine}
    </Stack>
  );
};
