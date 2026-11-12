import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { groupMatcher } from '@/features/group-matcher/api';
import { GroupMatcherSection } from '@/features/group-matcher/components/GroupMatcherSection/GroupMatcherSection';
import type { GroupMatcher } from '@/features/group-matcher/types';
import { JoinContact } from '@/features/membership/components/JoinContact';
import { JoinFaq } from '@/features/membership/components/JoinFaq/JoinFaq';
import { JoinPage } from '@/features/membership/components/JoinPage';
import { JoinSteps } from '@/features/membership/components/JoinSteps/JoinSteps';
import type { RouteHead } from '@/lib/seo/route-head';
import { indexablePageHead } from '@/lib/seo/route-head';
import { STATIC_PAGES } from '@/lib/seo/static-pages';

const JoinComponent: FC = () => (
  <JoinPage>
    <GroupMatcherSection />
    <JoinSteps />
    <JoinFaq />
    <JoinContact />
  </JoinPage>
);

export const Route = createFileRoute('/_site/join')({
  head: (): RouteHead => indexablePageHead(STATIC_PAGES.join),
  loader: (): Promise<GroupMatcher | null> => groupMatcher.ensure().catch((): null => null),
  component: JoinComponent,
});
