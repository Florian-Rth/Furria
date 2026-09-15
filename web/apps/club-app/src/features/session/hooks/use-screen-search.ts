import type { KkScreenSearch } from '@furria/ui';
import { appRouteApi } from '../app-route';

const OPEN_LABEL = 'Suchen';
const CANCEL_LABEL = 'Suche beenden';

export const useScreenSearch = (placeholder: string): KkScreenSearch => {
  const { q } = appRouteApi.useSearch();
  const navigate = appRouteApi.useNavigate();

  const go = (next: string | undefined, replace: boolean): void => {
    void navigate({ to: '.', search: (previous) => ({ ...previous, q: next }), replace });
  };

  return {
    query: q ?? null,
    placeholder,
    openLabel: OPEN_LABEL,
    cancelLabel: CANCEL_LABEL,
    onOpen: () => {
      go('', false);
    },
    onChange: (value) => {
      go(value, true);
    },
    onClose: () => {
      go(undefined, false);
    },
  };
};
