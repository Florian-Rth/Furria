import { useState } from 'react';

interface HubCelebrationState {
  fireKey: number;
  newMemberId: number | null;
  newAdminId: number | null;
}

export interface HubCelebration extends HubCelebrationState {
  celebrateMember: (personId: number) => void;
  markAdmin: (personId: number) => void;
}

const NOTHING_NEW: HubCelebrationState = { fireKey: 0, newMemberId: null, newAdminId: null };

export const useHubCelebration = (): HubCelebration => {
  const [state, setState] = useState<HubCelebrationState>(NOTHING_NEW);

  const celebrateMember = (personId: number): void => {
    setState((current) => ({
      fireKey: current.fireKey + 1,
      newMemberId: personId,
      newAdminId: null,
    }));
  };

  const markAdmin = (personId: number): void => {
    setState((current) => ({ ...current, newMemberId: null, newAdminId: personId }));
  };

  return { ...state, celebrateMember, markAdmin };
};
