import { KkPhotoPlaceholder } from '@furria/ui';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import type { FC } from 'react';
import { NewsPoster } from '@/features/news/components/NewsPoster';
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
        <NewsPoster category={post.category} />
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
