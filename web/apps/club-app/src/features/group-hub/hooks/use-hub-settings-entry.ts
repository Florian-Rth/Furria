import type { KkScreenActions } from '@furria/ui/screen-declaration';
import { useNavigate } from '@tanstack/react-router';
import { GROUP_SETTINGS_ACTION_LABEL } from '../group-hub-labels';
import type { GroupHub } from '../schemas';

const SETTINGS_PATH = '/groups/$groupId/settings';

export const useHubSettingsEntry = (hub: GroupHub | undefined): KkScreenActions | undefined => {
  const navigate = useNavigate();

  if (hub === undefined || !hub.viewerMayManage) {
    return undefined;
  }

  const params = { groupId: String(hub.groupId) };

  const openSettings = (): void => {
    void navigate({ to: SETTINGS_PATH, params });
  };

  return [
    {
      id: 'group-settings',
      label: GROUP_SETTINGS_ACTION_LABEL,
      icon: 'settings',
      link: { to: SETTINGS_PATH, params },
      onSelect: openSettings,
    },
  ];
};
