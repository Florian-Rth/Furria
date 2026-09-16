import { KkChip, KkPersonRow, KkSkeletonRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { toMembershipStateChip } from '@/lib/state-chips';
import { useMeQuery } from '../api';
import { PROFILE_PATH } from '../app-sections';

const PROFILE_META = 'Deine Daten und ihre Sichtbarkeit';
const SKELETON_ROWS = 1;

export const AppUserLink: FC = () => {
  const me = useMeQuery();

  if (me.data === undefined) {
    return <KkSkeletonRow count={SKELETON_ROWS} />;
  }

  const { person, membership } = me.data;
  const stateChip = toMembershipStateChip(membership.state);

  const chip = (
    <KkChip tone={stateChip.tone} dot={stateChip.dot} size="small">
      {stateChip.label}
    </KkChip>
  );

  return (
    <KkPersonRow
      initials={toInitials(person.firstName, person.lastName)}
      name={`${person.firstName} ${person.lastName}`}
      meta={PROFILE_META}
      trailing={chip}
      component={Link}
      to={PROFILE_PATH}
    />
  );
};
