import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { LaneMusicPage } from '@/features/lab-editor-a/components/LaneMusicPage';
import { LaneMusicSearchSchema } from '@/features/lab-editor-a/schemas';

const LaneMusicRoute: FC = () => {
  const { actId } = Route.useParams();
  const search = Route.useSearch();

  return <LaneMusicPage actId={actId} search={search} />;
};

export const Route = createFileRoute('/_app/lab_/editor-a/$actId_/musik')({
  validateSearch: LaneMusicSearchSchema,
  component: LaneMusicRoute,
});
