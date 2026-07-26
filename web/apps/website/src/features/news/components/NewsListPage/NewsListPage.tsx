import { kkTokens } from '@furria/ui';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { NewsSectionRule } from '@/features/news/components/NewsSectionRule';
import { moreNewsLabel, NEWS_POSTS, sortPostsByDateDesc } from '@/features/news/news-content';
import { NewsPageHead } from './internal/layout/NewsPageHead';
import { NewsPageTitleColumn } from './internal/layout/NewsPageTitleColumn';
import { NewsRowList } from './internal/layout/NewsRowList';
import { NewsPageEyebrow } from './internal/ui/NewsPageEyebrow';
import { NewsPageHeadline } from './internal/ui/NewsPageHeadline';
import { NewsPageIntro } from './internal/ui/NewsPageIntro';
import { NewsRow } from './internal/ui/NewsRow';

export const NewsListPage: FC = () => (
  <Stack component="main" sx={{ flex: 1 }}>
    <Container maxWidth="xl" sx={{ px: kkTokens.layout.gutterX, py: kkTokens.layout.gutterY }}>
      <Stack sx={{ gap: { xs: 4, md: 6 } }}>
        <NewsPageHead>
          <NewsPageTitleColumn>
            <NewsPageEyebrow />
            <NewsPageHeadline />
          </NewsPageTitleColumn>
          <NewsPageIntro />
        </NewsPageHead>
        <Divider sx={{ borderBottomWidth: 3, borderColor: 'text.primary' }} />
        <Stack component="section" data-kk-news-list sx={{ gap: { xs: 3, md: 4 } }}>
          <NewsSectionRule label={moreNewsLabel} />
          <NewsRowList>
            {sortPostsByDateDesc(NEWS_POSTS).map((post) => (
              <NewsRow key={post.slug} post={post} />
            ))}
          </NewsRowList>
        </Stack>
      </Stack>
    </Container>
  </Stack>
);
