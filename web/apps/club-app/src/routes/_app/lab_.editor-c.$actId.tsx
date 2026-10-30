import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { FocusLabPage } from '@/features/lab-editor-c/components/FocusLabPage';
import { FocusSearchSchema } from '@/features/lab-editor-c/schemas';

const FocusEditorRoute: FC = () => {
  const { actId } = Route.useParams();
  const search = Route.useSearch();

  return <FocusLabPage actId={actId} search={search} />;
};

export const Route = createFileRoute('/_app/lab_/editor-c/$actId')({
  validateSearch: FocusSearchSchema,
  component: FocusEditorRoute,
});
