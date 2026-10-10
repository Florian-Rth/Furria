import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkNewsCopy } from '../../../internal/news-surface/KkNewsCopy';
import { KkNewsCutWatch } from '../../../internal/news-surface/KkNewsCutWatch';

const TEASER_LINES = 2;

interface KkNewsRowTeaserProps {
  teaser: string | null;
}

export const KkNewsRowTeaser: FC<KkNewsRowTeaserProps> = ({ teaser }) => (
  <KkNewsCutWatch>
    <Typography
      variant="body2"
      sx={{
        color: 'text.secondary',
        textWrap: 'pretty',
        maxWidth: '40rem',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: TEASER_LINES,
        overflow: 'hidden',
      }}
    >
      <KkNewsCopy text={teaser} kind="teaser" />
    </Typography>
  </KkNewsCutWatch>
);
