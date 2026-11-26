import { useMeQuery } from '@/features/session/api';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { toPersonGaps } from '../person-identity';
import type { PersonDetails } from '../schemas';

export interface PersonHelpViewer {
  managesPersons: boolean;
  managesAccounts: boolean;
  deletesPersons: boolean;
  keepsClubGroup: boolean;
  isArchived: boolean;
  showsFeeReductions: boolean;
  showsTies: boolean;
}

export const usePersonHelpViewer = (
  person: PersonDetails | undefined,
): PersonHelpViewer | undefined => {
  const { has, isUndecided } = usePermissions();
  const me = useMeQuery();

  if (person === undefined || isUndecided) {
    return undefined;
  }

  const gaps = toPersonGaps(person);

  return {
    managesPersons: has(PERMISSION_KEYS.personsManage),
    managesAccounts: has(PERMISSION_KEYS.accountsManage),
    deletesPersons: has(PERMISSION_KEYS.personsDelete),
    keepsClubGroup: me.data?.keepsClubGroup === true,
    isArchived: person.archive !== null,
    showsFeeReductions: !gaps.includes('feeReductions'),
    showsTies: !gaps.includes('ties') || !gaps.includes('keys'),
  };
};
