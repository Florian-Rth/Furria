import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkLaneFilmCaptionProps {
  title: string;
  meta: string | null;
}

export const KkLaneFilmCaption: FC<KkLaneFilmCaptionProps> = ({ title, meta }) => {
  const metaLine =
    meta === null ? null : (
      <Typography
        component="span"
        variant="caption"
        noWrap
        sx={{ opacity: 0.8, fontVariantNumeric: 'tabular-nums' }}
      >
        {meta}
      </Typography>
    );

  return (
    <Stack sx={{ flex: 1, minWidth: 0 }}>
      <Typography component="span" variant="subtitle2" noWrap>
        {title}
      </Typography>
      {metaLine}
    </Stack>
  );
};
