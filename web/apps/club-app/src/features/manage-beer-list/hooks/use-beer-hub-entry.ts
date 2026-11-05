import type { KkScreenActions } from '@furria/ui/screen-declaration';
import { useNavigate } from '@tanstack/react-router';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { HUB_ENTRY_LABEL, HUB_PATH } from '../beer-hub-copy';

export const useBeerHubEntry = (): KkScreenActions | undefined => {
  const navigate = useNavigate();
  const manages = usePermissions().has(PERMISSION_KEYS.beerListManage);

  if (!manages) {
    return undefined;
  }

  const openHub = (): void => {
    void navigate({ to: HUB_PATH });
  };

  return [
    {
      id: 'beer-hub',
      label: HUB_ENTRY_LABEL,
      icon: 'manage',
      link: { to: HUB_PATH },
      onSelect: openHub,
    },
  ];
};
