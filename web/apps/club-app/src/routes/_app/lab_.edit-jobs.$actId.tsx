import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { ActPageSearchSchema } from '@/features/acts/schemas';
import { EditJobsLabPage } from '@/features/lab-edit-jobs/components/EditJobsLabPage';

const EditJobsLabRoute: FC = () => {
  const { actId } = Route.useParams();
  const { evening } = Route.useSearch();

  return <EditJobsLabPage actId={actId} evening={evening} />;
};

export const Route = createFileRoute('/_app/lab_/edit-jobs/$actId')({
  validateSearch: ActPageSearchSchema,
  component: EditJobsLabRoute,
});
