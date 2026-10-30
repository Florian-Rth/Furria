import Stack from '@mui/material/Stack';
import type { CSSObject } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { lineClamp } from './internal/line-clamp';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const TITLE_PAINT: CSSObject = {
  ...lineClamp(2),
  m: 0,
  letterSpacing: kkTokens.type.tracking.display,
  lineHeight: 1.05,
};

const META_PAINT: CSSObject = { m: 0, color: 'text.secondary', fontWeight: 700 };

interface KkPassHeadProps {
  title: string;
  meta: string;
  media?: ReactNode;
  aside?: ReactNode;
  sx?: KkSx;
}

export const KkPassHead: FC<KkPassHeadProps> = ({ title, meta, media, aside, sx }) => (
  <Stack
    component="header"
    direction="row"
    data-kk-pass-head
    sx={[{ alignItems: 'center', gap: 1.5, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {media}
    <Stack sx={{ minWidth: 0, flex: 1, gap: 0.25 }}>
      <Typography component="h1" variant="h2" sx={TITLE_PAINT}>
        {title}
      </Typography>
      <Typography component="p" variant="caption" sx={META_PAINT}>
        {meta}
      </Typography>
    </Stack>
    {aside}
  </Stack>
);
