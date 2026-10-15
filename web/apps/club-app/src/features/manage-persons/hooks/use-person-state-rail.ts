import { useNavigate } from '@tanstack/react-router';
import { toAccessLandingKey, useAccessActions } from '@/features/account-access';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import type { AppAct, AppLead, IdentitySection, IdentityTile } from '../person-identity';
import { toAppAct, toAppLead, toIdentityTiles, toSectionLandingKey } from '../person-identity';
import type { PersonDetails } from '../schemas';

const ACCESS_ONLY_SECTIONS: readonly IdentitySection[] = ['memberships'];

export interface PersonStateRail {
  lead: AppLead;
  act: AppAct | null;
  tiles: IdentityTile[];
  jumpTo: (section: IdentitySection) => void;
  jumpToApp: () => void;
}

export const usePersonStateRail = (person: PersonDetails): PersonStateRail => {
  const navigate = useNavigate();
  const { has } = usePermissions();
  const actions = useAccessActions(person);
  const today = new Date();
  const allTiles = toIdentityTiles(person, today, person.honours.sessions);
  const tiles = has(PERMISSION_KEYS.personsManage)
    ? allTiles
    : allTiles.filter((tile) => ACCESS_ONLY_SECTIONS.includes(tile.section));

  const land = (key: string): void => {
    void navigate({
      to: '.',
      search: (previous) => ({ ...previous, changed: key }),
      replace: true,
      resetScroll: false,
    });
  };

  return {
    lead: toAppLead(person.access, person.email),
    act: toAppAct(actions),
    tiles,
    jumpTo: (section) => land(toSectionLandingKey(section, person.personId)),
    jumpToApp: () => land(toAccessLandingKey(person.personId)),
  };
};
