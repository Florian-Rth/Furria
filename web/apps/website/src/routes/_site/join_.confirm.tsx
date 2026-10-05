import { createFileRoute } from '@tanstack/react-router';
import { ConfirmPage } from '@/features/membership';
import type { RouteHead } from '@/lib/seo';
import { NO_INDEX_META, pageTitle } from '@/lib/seo';

export const Route = createFileRoute('/_site/join_/confirm')({
  head: (): RouteHead => ({ meta: [{ title: pageTitle('Antrag bestätigen') }, NO_INDEX_META] }),
  component: ConfirmPage,
});
