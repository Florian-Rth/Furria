import { kkTokens } from '@furria/ui';
import Button from '@mui/material/Button';
import type { FC } from 'react';
import { buildWhatsAppShareUrl, whatsAppShareLabel } from '@/features/news/news-content';
import type { NewsPost } from '@/lib/public-news/schemas';

interface NewsWhatsAppShareButtonProps {
  post: NewsPost;
}

export const NewsWhatsAppShareButton: FC<NewsWhatsAppShareButtonProps> = ({ post }) => (
  <Button
    component="a"
    href={buildWhatsAppShareUrl(post.title, window.location.href)}
    target="_blank"
    rel="noopener noreferrer"
    variant="contained"
    size="large"
    sx={{
      minHeight: kkTokens.tapTarget,
      alignSelf: { xs: 'stretch', sm: 'auto' },
      '&:focus-visible': {
        outlineWidth: 2,
        outlineStyle: 'solid',
        outlineColor: 'text.primary',
        outlineOffset: 2,
      },
    }}
  >
    {whatsAppShareLabel}
  </Button>
);
