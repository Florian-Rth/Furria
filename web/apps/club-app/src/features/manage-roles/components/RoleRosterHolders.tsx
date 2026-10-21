import { KkMeta, KkRoster } from '@furria/ui';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { toPersonName } from '../manage-roles-labels';
import { toHolderPreview, toSeatedOffices } from '../roles-hub';
import { NOBODY_LINE, toMoreHolders } from '../roles-hub-copy';
import type { RoleSummary } from '../schemas';

interface RoleRosterHoldersProps {
  role: RoleSummary;
}

export const RoleRosterHolders: FC<RoleRosterHoldersProps> = ({ role }) => {
  const preview = toHolderPreview(role.holders);
  const seats = preview.shown.map((holder) => (
    <KkRoster.Seat
      key={holder.personId}
      initials={toInitials(holder.firstName, holder.lastName)}
      name={toPersonName(holder)}
    />
  ));
  const more =
    preview.more === 0 ? null : <KkMeta component="span">{toMoreHolders(preview.more)}</KkMeta>;
  const nobody =
    role.holders.length === 0 && toSeatedOffices(role).length === 0 ? (
      <KkMeta component="span">{NOBODY_LINE}</KkMeta>
    ) : null;

  return (
    <>
      {seats}
      {more}
      {nobody}
    </>
  );
};
