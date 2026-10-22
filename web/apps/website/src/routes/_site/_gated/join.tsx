import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { GroupMatcherSection } from '@/features/group-matcher/components/GroupMatcherSection/GroupMatcherSection';
import { JoinContact } from '@/features/membership/components/JoinContact';
import { JoinFaq } from '@/features/membership/components/JoinFaq/JoinFaq';
import { JoinPage } from '@/features/membership/components/JoinPage';
import { JoinSteps } from '@/features/membership/components/JoinSteps/JoinSteps';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const JOIN_TITLE = pageTitle('Mitglied werden');
const JOIN_DESCRIPTION =
  'Mitglied im Furrschen Carnevals Club e.V. werden: was die Mitgliedschaft kostet, was sie bedeutet, wo du hinpasst — und der Weg zum Beitrittsantrag. Du musst nicht tanzen können.';

const JoinComponent: FC = () => (
  <JoinPage>
    <GroupMatcherSection />
    <JoinSteps />
    <JoinFaq />
    <JoinContact />
  </JoinPage>
);

export const Route = createFileRoute('/_site/_gated/join')({
  head: (): RouteHead => ({
    meta: [
      { title: JOIN_TITLE },
      { name: 'description', content: JOIN_DESCRIPTION },
      { property: 'og:title', content: JOIN_TITLE },
      { property: 'og:description', content: JOIN_DESCRIPTION },
    ],
  }),
  component: JoinComponent,
});
