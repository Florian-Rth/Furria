import { useLocation, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useMembershipApplicationConfirmationQuery } from '../api';
import { confirmPath } from '../confirmation-content';
import type { ConfirmationStage } from '../confirmation-stage';
import { resolveConfirmationStage } from '../confirmation-stage';
import { readConfirmationToken } from '../confirmation-token';

export interface ConfirmationState {
  stage: ConfirmationStage;
  retry: () => void;
}

export const useConfirmation = (): ConfirmationState => {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState(() => readConfirmationToken(hash));
  const [seenHash, setSeenHash] = useState(hash);

  if (hash !== seenHash) {
    setSeenHash(hash);
    if (hash !== '') {
      setToken(readConfirmationToken(hash));
    }
  }

  const { data, error, isFetching, refetch } = useMembershipApplicationConfirmationQuery(token);

  useEffect(() => {
    if (hash === '') {
      return;
    }

    void navigate({ to: confirmPath, replace: true });
  }, [hash, navigate]);

  return {
    stage: resolveConfirmationStage(token, data, error, isFetching),
    retry: () => {
      void refetch();
    },
  };
};
