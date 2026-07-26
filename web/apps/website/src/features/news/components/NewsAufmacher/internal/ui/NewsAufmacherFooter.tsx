import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { NewsPost } from '@/features/news/news-content';
import { deriveReadingTime, readMoreLabel } from '@/features/news/news-content';

interface NewsAufmacherFooterProps {
  post: NewsPost;
}

export const NewsAufmacherFooter: FC<NewsAufmacherFooterProps> = ({ post }) => {
  const readingTime = deriveReadingTime(post.body);

  return (
    <Stack
      direction="row"
      sx={{
        width: '100%',
        mt: 'auto',
        pt: { xs: 1.5, md: 2.5 },
        gap: 2,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
      }}
    >
      <Typography
        component="span"
        sx={{ fontWeight: 900, fontSize: '0.9375rem', color: 'redInk.main' }}
      >
        {readMoreLabel}
      </Typography>
      {readingTime !== null && (
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, letterSpacing: '0.04em', color: 'text.secondary' }}
        >
          {readingTime}
        </Typography>
      )}
    </Stack>
  );
};
