import type { FC } from 'react';
import { BackLink } from '@/components/BackLink';
import { backToListLabel } from '@/features/news/news-content';

export const NewsPostBackLink: FC = () => <BackLink to="/news">{backToListLabel}</BackLink>;
