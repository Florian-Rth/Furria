import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { LessonPage } from '@/features/lab-home-b/components/LessonPage';

const LessonRoute: FC = () => {
  const { actId } = Route.useParams();

  return <LessonPage actId={actId} />;
};

export const Route = createFileRoute('/_app/lab_/home-b/$actId')({
  component: LessonRoute,
});
