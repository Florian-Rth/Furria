import { kkTokens } from '@furria/ui';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { NewsPost } from '@/features/news/news-content';
import { NewsPostBody } from './internal/layout/NewsPostBody';
import { NewsPostColumn } from './internal/layout/NewsPostColumn';
import { NewsPostHeader } from './internal/layout/NewsPostHeader';
import { NewsShareRow } from './internal/layout/NewsShareRow';
import { NewsCopyLinkButton } from './internal/ui/NewsCopyLinkButton';
import { NewsPostBackLink } from './internal/ui/NewsPostBackLink';
import { NewsPostHeadline } from './internal/ui/NewsPostHeadline';
import { NewsPostHero } from './internal/ui/NewsPostHero';
import { NewsPostLead } from './internal/ui/NewsPostLead';
import { NewsPostMeta } from './internal/ui/NewsPostMeta';
import { NewsPostParagraph } from './internal/ui/NewsPostParagraph';
import { NewsShareLabel } from './internal/ui/NewsShareLabel';
import { NewsWhatsAppShareButton } from './internal/ui/NewsWhatsAppShareButton';

interface NewsPostPageProps {
  post: NewsPost;
}

export const NewsPostPage: FC<NewsPostPageProps> = ({ post }) => (
  <Stack component="main" sx={{ flex: 1 }}>
    <Container maxWidth="md" sx={{ px: kkTokens.layout.gutterX, py: kkTokens.layout.gutterY }}>
      <NewsPostColumn>
        <NewsPostHeader>
          <NewsPostBackLink />
          <NewsPostMeta post={post} />
          <NewsPostHeadline post={post} />
          <NewsPostLead post={post} />
        </NewsPostHeader>
        <NewsPostHero post={post} />
        <NewsPostBody>
          {post.body.map((paragraph) => (
            <NewsPostParagraph key={paragraph} paragraph={paragraph} />
          ))}
        </NewsPostBody>
        <NewsShareRow>
          <NewsShareLabel />
          <NewsWhatsAppShareButton post={post} />
          <NewsCopyLinkButton />
        </NewsShareRow>
      </NewsPostColumn>
    </Container>
  </Stack>
);
