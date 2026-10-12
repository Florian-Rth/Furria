import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/reads';
import { isPasskeySupported } from './passkey-support';

export const usePasskeySupport = (): boolean => {
  const support = useQuery({
    queryKey: queryKeys.passkeySupport,
    queryFn: isPasskeySupported,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    retry: false,
  });

  return support.data === true;
};
