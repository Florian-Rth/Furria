import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { ClubPage } from '@/features/club';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const CLUB_TITLE = pageTitle('Verein');
const CLUB_DESCRIPTION =
  'Der Furrsche Carnevals Club e.V. — wer wir sind: unsere Geschichte, unsere Gruppen, die Menschen dahinter und der Weg in den Verein. Die fünfte Jahreszeit hat ein Zuhause.';

const ClubComponent: FC = () => <ClubPage />;

export const Route = createFileRoute('/_site/_gated/club')({
  head: (): RouteHead => ({
    meta: [
      { title: CLUB_TITLE },
      { name: 'description', content: CLUB_DESCRIPTION },
      { property: 'og:title', content: CLUB_TITLE },
      { property: 'og:description', content: CLUB_DESCRIPTION },
    ],
  }),
  component: ClubComponent,
});
