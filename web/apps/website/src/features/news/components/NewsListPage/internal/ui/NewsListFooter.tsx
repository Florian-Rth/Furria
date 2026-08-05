import { KkNote } from '@furria/ui';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { NewsPost } from '@/features/news/news-content';
import {
  buildArchiveLabel,
  buildNewsListFooterNote,
  newsArchiveHref,
  resolveArchiveSession,
} from '@/features/news/news-content';

interface NewsListFooterProps {
  posts: NewsPost[];
  reference: Date;
}

export const NewsListFooter: FC<NewsListFooterProps> = ({ posts, reference }) => {
  const archiveSession = resolveArchiveSession(posts, reference);

  return (
    <Stack
      data-kk-news-footer
      direction={{ xs: 'column', sm: 'row' }}
      sx={{
        borderTop: 1,
        borderColor: 'divider',
        pt: { xs: 3, md: 4 },
        gap: { xs: 2, sm: 3 },
        alignItems: { sm: 'center' },
        justifyContent: 'space-between',
      }}
    >
      <KkNote>{buildNewsListFooterNote(archiveSession)}</KkNote>
      {archiveSession !== null && (
        <Button
          href={newsArchiveHref}
          variant="outlined"
          size="large"
          sx={{ flexShrink: 0, alignSelf: { xs: 'stretch', sm: 'auto' } }}
        >
          {buildArchiveLabel(archiveSession)}
        </Button>
      )}
    </Stack>
  );
};
