import type { FC } from 'react';
import { useClubSectionGate } from '../hooks/use-club-section-gate';
import { ClubContactEditor } from './ClubContactEditor';
import { ClubSectionFallback } from './ClubSectionFallback';

export const ClubContactScreen: FC = () => {
  const gate = useClubSectionGate();

  if (gate.record === null) {
    return <ClubSectionFallback section="contact" gate={gate} />;
  }

  return <ClubContactEditor record={gate.record} />;
};
