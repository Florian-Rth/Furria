import type { FC } from 'react';
import { useClubSectionGate } from '../hooks/use-club-section-gate';
import { ClubIdentityEditor } from './ClubIdentityEditor';
import { ClubSectionFallback } from './ClubSectionFallback';

export const ClubIdentityScreen: FC = () => {
  const gate = useClubSectionGate();

  if (gate.record === null) {
    return <ClubSectionFallback section="identity" gate={gate} />;
  }

  return <ClubIdentityEditor record={gate.record} />;
};
