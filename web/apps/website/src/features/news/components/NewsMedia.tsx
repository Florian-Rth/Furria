import { KkPhotoPlaceholder } from '@furria/ui';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import type { FC } from 'react';
import { NewsPlakat } from '@/features/news/components/NewsPlakat';
import type { NewsPost } from '@/features/news/news-content';

interface NewsMediaProps {
  post: NewsPost;
  sx?: SxProps<Theme>;
}

export const NewsMedia: FC<NewsMediaProps> = ({ post, sx }) => {
  const theme = useTheme();

  return (
    <Box data-kk-news-media sx={[{ width: '100%' }, ...(Array.isArray(sx) ? sx : [sx])]}>
      {post.image === null ? (
        <NewsPlakat category={post.category} />
      ) : (
        <KkPhotoPlaceholder
          label={post.image}
          tint={(theme.vars ?? theme).palette.text.primary}
          fill
        />
      )}
    </Box>
  );
};
