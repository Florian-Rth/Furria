import type { UseNavigateResult } from '@tanstack/react-router';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { pathnameBehind, stepBack, toPathname } from './back-stack';

export const useGoBackTo = (): UseNavigateResult<string> => {
  const router = useRouter();
  const navigate = useNavigate();

  return async (options) => {
    const { history } = router;
    const target =
      options.href ?? router.buildLocation({ ...options, leaveParams: false }).publicHref;

    if (pathnameBehind(history.location) === toPathname(target)) {
      await stepBack(history, options.ignoreBlocker ?? false);

      if (options.search === undefined) {
        return;
      }
    }

    await navigate({ ...options, replace: true });
  };
};
