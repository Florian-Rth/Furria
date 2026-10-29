import type { FC } from 'react';
import { useClubSectionGate } from '../hooks/use-club-section-gate';
import { ClubSectionFallback } from './ClubSectionFallback';
import { ClubStageEditor } from './ClubStageEditor';

export const ClubStageScreen: FC = () => {
  const gate = useClubSectionGate();

  if (gate.record === null) {
    return <ClubSectionFallback section="stage" gate={gate} />;
  }

  return <ClubStageEditor record={gate.record} />;
};
