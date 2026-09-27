import { useQuery } from '@tanstack/react-query';
import { isPasskeySupported } from './passkey-support';

const PASSKEY_SUPPORT_QUERY_KEY = ['passkey-support'] as const;

export const usePasskeySupport = (): boolean => {
  const support = useQuery({
    queryKey: PASSKEY_SUPPORT_QUERY_KEY,
    queryFn: isPasskeySupported,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    retry: false,
  });

  return support.data === true;
};
