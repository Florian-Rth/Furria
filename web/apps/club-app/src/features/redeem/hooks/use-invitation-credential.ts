import { useLocation, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import type { InvitationCredential } from '../invitation-credential';
import { readInvitationCredential } from '../invitation-credential';
import { INVITATION_PATH } from '../invitation-token';

export const useInvitationCredential = (): InvitationCredential | null => {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const [credential] = useState(() => readInvitationCredential(hash));

  useEffect(() => {
    if (hash === '') {
      return;
    }

    void navigate({ to: INVITATION_PATH, replace: true });
  }, [hash, navigate]);

  return credential;
};
