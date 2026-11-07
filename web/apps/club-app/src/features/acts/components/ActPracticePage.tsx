import { KkScreen } from '@furria/ui/KkScreen';
import { Navigate } from '@tanstack/react-router';
import type { FC } from 'react';
import { useStudioVisit } from '@/features/act-studio/hooks/use-studio-visit';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { useActPracticePage } from '../hooks/use-act-practice-page';
import type { ActScreenSearch } from '../schemas';
import { ActLoadGate } from './ActLoadGate';
import { ActPracticeBody } from './ActPracticeBody';

interface ActPracticePageProps {
  actId: string;
  eventId: string | null;
  editing: boolean;
  search: ActScreenSearch;
}

export const ActPracticePage: FC<ActPracticePageProps> = ({ actId, eventId, editing, search }) => {
  const page = useActPracticePage(actId, eventId, editing, search);
  useStudioVisit(page.load.actId);
  const studio = page.load.query.data?.studio ?? null;
  const body =
    page.load.actId === null || studio === null ? null : (
      <ActPracticeBody page={page} actId={page.load.actId} studio={studio} />
    );
  const screen = (
    <KkScreen kind="fullscreen" title={page.title} origin={page.origin} actions={page.actions}>
      {body}
    </KkScreen>
  );
  const found = page.isEveningMissing ? <ScreenNotFound /> : screen;
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
