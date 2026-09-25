import type { FC } from 'react';
import { useClubSectionGate } from '../hooks/use-club-section-gate';
import { ClubAccessEditor } from './ClubAccessEditor';
import { ClubSectionFallback } from './ClubSectionFallback';

export const ClubAccessScreen: FC = () => {
  const gate = useClubSectionGate();

  if (gate.record === null) {
    return <ClubSectionFallback section="access" gate={gate} />;
  }

  return <ClubAccessEditor record={gate.record} />;
};
