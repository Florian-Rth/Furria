import type { KkScreenOrigin } from '@furria/ui';
import { toOriginHref } from '@/features/write';
import { useGoBackTo } from '@/lib/use-go-back-to';

export const useOriginReturn = (): ((origin: KkScreenOrigin) => void) => {
  const goBackTo = useGoBackTo();

  return (origin) => {
    void goBackTo({ href: toOriginHref(origin) });
  };
};
