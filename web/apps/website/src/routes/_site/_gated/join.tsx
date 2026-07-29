import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { JoinPage } from '@/features/membership';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const JOIN_TITLE = pageTitle('Mitglied werden');
const JOIN_DESCRIPTION =
  'Mitglied im Furrschen Carnevals Club e.V. werden: was die Mitgliedschaft kostet, was sie bedeutet, wo du hinpasst — und der Weg zum Beitrittsantrag. Du musst nicht tanzen können.';

const JoinComponent: FC = () => <JoinPage />;

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
