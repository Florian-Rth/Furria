import { useLocation, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { RESET_PASSWORD_PATH } from '@/features/login';
import { readPasswordReset } from '../reset-fragment';

export const usePasswordResetFragment = (): string | null => {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const [reset] = useState(() => readPasswordReset(hash));

  useEffect(() => {
    if (hash === '') {
      return;
    }

    void navigate({ to: RESET_PASSWORD_PATH, replace: true });
  }, [hash, navigate]);

  return reset;
};
