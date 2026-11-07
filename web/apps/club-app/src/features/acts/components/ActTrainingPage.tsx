import { KkScreen } from '@furria/ui/KkScreen';
import { Navigate } from '@tanstack/react-router';
import type { FC } from 'react';
import { useStudioVisit } from '@/features/act-studio/hooks/use-studio-visit';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { useActTrainingPage } from '../hooks/use-act-training-page';
import type { ActScreenSearch } from '../schemas';
import { ActLoadGate } from './ActLoadGate';
import { ActTrainingPageBody } from './ActTrainingPageBody';

interface ActTrainingPageProps {
  actId: string;
  trainingId: string | null;
  search: ActScreenSearch;
}

export const ActTrainingPage: FC<ActTrainingPageProps> = ({ actId, trainingId, search }) => {
  const page = useActTrainingPage(actId, trainingId, search);
  useStudioVisit(page.load.actId);
  const studio = page.load.query.data?.studio ?? null;
  const body =
    page.load.actId === null || studio === null ? null : (
      <ActTrainingPageBody page={page} actId={page.load.actId} studio={studio} />
    );
  const screen = (
    <KkScreen kind="fullscreen" title={page.title} origin={page.origin} actions={page.actions}>
      {body}
    </KkScreen>
  );
  const found = page.isTrainingMissing ? <ScreenNotFound /> : screen;
  const shown =
    page.redirectPath === null ? (
      found
    ) : (
      <Navigate to={page.redirectPath} search={page.originSearch} replace />
    );

  return (
    <ActLoadGate load={page.load} title={page.title} origin={page.origin}>
      {shown}
    </ActLoadGate>
  );
};
