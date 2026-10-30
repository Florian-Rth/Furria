import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { FocusMusicPage } from '@/features/lab-editor-c/components/FocusMusicPage';
import { FocusMusicSearchSchema } from '@/features/lab-editor-c/schemas';

const FocusMusicRoute: FC = () => {
  const { actId } = Route.useParams();
  const search = Route.useSearch();

  return <FocusMusicPage actId={actId} search={search} />;
};

export const Route = createFileRoute('/_app/lab_/editor-c/$actId_/musik')({
  validateSearch: FocusMusicSearchSchema,
  component: FocusMusicRoute,
});
