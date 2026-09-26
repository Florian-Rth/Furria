import { useLocation, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { INVITATION_PATH, readInvitationToken } from '../invitation-token';

export const useInvitationToken = (): string | null => {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const [token] = useState(() => readInvitationToken(hash));

  useEffect(() => {
    if (hash === '') {
      return;
    }

    void navigate({ to: INVITATION_PATH, replace: true });
  }, [hash, navigate]);

  return token;
};
