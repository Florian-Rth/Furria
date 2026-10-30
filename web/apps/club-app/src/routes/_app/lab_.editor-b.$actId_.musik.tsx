import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { EightsMusicPage } from '@/features/lab-editor-b/components/EightsMusicPage';
import { EightsMusicSearchSchema } from '@/features/lab-editor-b/schemas';

const EightsMusicRoute: FC = () => {
  const { actId } = Route.useParams();
  const search = Route.useSearch();

  return <EightsMusicPage actId={actId} search={search} />;
};

export const Route = createFileRoute('/_app/lab_/editor-b/$actId_/musik')({
  validateSearch: EightsMusicSearchSchema,
  component: EightsMusicRoute,
});
