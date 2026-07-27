import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { parseInlineBold } from '@/features/news/news-content';

interface NewsPostParagraphProps {
  paragraph: string;
}

export const NewsPostParagraph: FC<NewsPostParagraphProps> = ({ paragraph }) => (
  <Typography
    variant="body1"
    sx={{
      fontSize: { xs: '1rem', md: '1.125rem' },
      lineHeight: 1.72,
      textWrap: 'pretty',
    }}
  >
    {parseInlineBold(paragraph).map((segment, index) =>
      segment.bold ? <b key={`${index}-${segment.text}`}>{segment.text}</b> : segment.text,
    )}
  </Typography>
);
