import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { LaneEditorPage } from '@/features/lab-editor-a/components/LaneEditorPage';
import { LaneSearchSchema } from '@/features/lab-editor-a/schemas';

const LaneEditorRoute: FC = () => {
  const { actId } = Route.useParams();
  const search = Route.useSearch();

  return <LaneEditorPage actId={actId} search={search} />;
};

export const Route = createFileRoute('/_app/lab_/editor-a/$actId')({
  validateSearch: LaneSearchSchema,
  component: LaneEditorRoute,
});
