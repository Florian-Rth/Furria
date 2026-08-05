import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { ApplyPage, ApplySearchSchema, parseGroupInterestsParam } from '@/features/membership';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const APPLY_TITLE = pageTitle('Beitrittsantrag');
const APPLY_DESCRIPTION =
  'Beitrittsantrag für den Furrschen Carnevals Club e.V.: ein Formular, zwei Minuten. Mitgliedschaft und Beitrag ergeben sich aus dem Geburtsdatum, jetzt wird nichts abgebucht.';

const ApplyComponent: FC = () => {
  const { groups } = Route.useSearch();
  const prefilledGroupInterests = parseGroupInterestsParam(groups);

  return <ApplyPage prefilledGroupInterests={prefilledGroupInterests} />;
};

export const Route = createFileRoute('/_site/_gated/join_/apply')({
  validateSearch: ApplySearchSchema,
  head: (): RouteHead => ({
    meta: [
      { title: APPLY_TITLE },
      { name: 'description', content: APPLY_DESCRIPTION },
      { property: 'og:title', content: APPLY_TITLE },
      { property: 'og:description', content: APPLY_DESCRIPTION },
    ],
  }),
  component: ApplyComponent,
});
