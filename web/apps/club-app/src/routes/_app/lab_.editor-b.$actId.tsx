import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { EightsEditorPage } from '@/features/lab-editor-b/components/EightsEditorPage';
import { EightsSearchSchema } from '@/features/lab-editor-b/schemas';

const EightsEditorRoute: FC = () => {
  const { actId } = Route.useParams();
  const search = Route.useSearch();

  return <EightsEditorPage actId={actId} search={search} />;
};

export const Route = createFileRoute('/_app/lab_/editor-b/$actId')({
  validateSearch: EightsSearchSchema,
  component: EightsEditorRoute,
});
