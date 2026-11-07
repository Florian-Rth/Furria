import { KkScreen } from '@furria/ui/KkScreen';
import { Navigate } from '@tanstack/react-router';
import type { FC } from 'react';
import { useStudioVisit } from '@/features/act-studio/hooks/use-studio-visit';
import { useActDetailsPage } from '../hooks/use-act-details-page';
import type { ActScreenSearch } from '../schemas';
import { ActDetailsBody } from './ActDetailsBody';
import { ActLoadGate } from './ActLoadGate';

interface ActDetailsPageProps {
  actId: string;
  search: ActScreenSearch;
}

export const ActDetailsPage: FC<ActDetailsPageProps> = ({ actId, search }) => {
  const page = useActDetailsPage(actId, search);
  useStudioVisit(page.actId);
  const screen =
    page.redirectPath === null ? (
      <KkScreen kind="detail" title={page.title} origin={page.origin} actions={page.actions}>
        <ActDetailsBody page={page} />
      </KkScreen>
    ) : (
      <Navigate to={page.redirectPath} search={page.originSearch} replace />
    );

  return (
    <ActLoadGate load={page.load} title={page.title} origin={page.origin}>
      {screen}
    </ActLoadGate>
  );
};
