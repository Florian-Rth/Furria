import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkNewsLink } from '../internal/news-surface/news-link';
import { KkEyebrow } from '../KkEyebrow';
import type { KkSx } from '../kk-sx';
import { KkNewsTieFrame } from './internal/layout/KkNewsTieFrame';
import { KkNewsTieCta } from './internal/ui/KkNewsTieCta';
import type { KkNewsStripPhoto } from './internal/ui/KkNewsTieStrip';
import { KkNewsTieStrip } from './internal/ui/KkNewsTieStrip';

interface KkNewsAlbumCardProps {
  eyebrow: string;
  title: string;
  line: string;
  photos: readonly KkNewsStripPhoto[];
  ctaLabel: string;
  link: KkNewsLink;
  sx?: KkSx;
}

export const KkNewsAlbumCard: FC<KkNewsAlbumCardProps> = ({
  eyebrow,
  title,
  line,
  photos,
  ctaLabel,
  link,
  sx,
}) => (
  <KkNewsTieFrame label={title} link={link} sx={sx}>
    <KkEyebrow>{eyebrow}</KkEyebrow>
    <Stack sx={{ minWidth: 0 }}>
      <Typography variant="h4" component="p" data-kk-card-title sx={{ hyphens: 'auto' }}>
        {title}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
        {line}
      </Typography>
    </Stack>
    <KkNewsTieStrip photos={photos} />
    <KkNewsTieCta label={ctaLabel} />
  </KkNewsTieFrame>
);
