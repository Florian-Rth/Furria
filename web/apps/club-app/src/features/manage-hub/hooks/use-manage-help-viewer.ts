import { relevantSessionYear } from '@/lib/club';
import { formatSessionLabel } from '@/lib/membership-labels';
import { useManageHubQuery } from '../api';
import type { ManageBankModel } from '../manage-hub-labels';
import { toManageBanks, toManageRows } from '../manage-hub-labels';

export interface ManageHelpViewer {
  banks: readonly ManageBankModel[];
}

export const useManageHelpViewer = (): ManageHelpViewer | undefined => {
  const manageHub = useManageHubQuery();

  if (manageHub.data === undefined) {
    return undefined;
  }

  const sessionLabel = formatSessionLabel(relevantSessionYear(new Date()));

  return { banks: toManageBanks(toManageRows(manageHub.data, sessionLabel)) };
};
