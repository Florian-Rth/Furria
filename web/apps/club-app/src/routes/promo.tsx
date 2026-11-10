import { createFileRoute, redirect } from '@tanstack/react-router';
import { buildLoginSearch } from '@/features/login/login-redirect';
import { PromoScreen } from '@/features/promo/components/PromoScreen';
import { AppFailure } from '@/features/session/components/AppFailure';
import { getSessionSnapshot } from '@/lib/api/session/session-store';
import { LOGIN_PATH } from '@/lib/return-to';

export const Route = createFileRoute('/promo')({
  beforeLoad: ({ location }) => {
    const { status, expired, farewell } = getSessionSnapshot();

    if (status === 'anonymous') {
      throw redirect({
        to: LOGIN_PATH,
        search: buildLoginSearch(location.href, expired, farewell),
        replace: true,
      });
    }
  },
  component: PromoScreen,
  errorComponent: AppFailure,
});
