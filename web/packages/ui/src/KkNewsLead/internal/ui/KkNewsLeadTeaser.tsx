import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkNewsCopy } from '../../../internal/news-surface/KkNewsCopy';
import { KkNewsCutWatch } from '../../../internal/news-surface/KkNewsCutWatch';

const TEASER_LINES = 3;

interface KkNewsLeadTeaserProps {
  teaser: string | null;
}

export const KkNewsLeadTeaser: FC<KkNewsLeadTeaserProps> = ({ teaser }) => (
  <KkNewsCutWatch>
    <Typography
      variant="body1"
      sx={{
        color: 'text.secondary',
        textWrap: 'pretty',
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
