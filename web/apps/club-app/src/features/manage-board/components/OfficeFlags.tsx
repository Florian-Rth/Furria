import { KkRoster } from '@furria/ui/KkRoster';
import type { FC } from 'react';
import { OFFLINE_FLAG, PUBLIC_FLAG, toRoleFlag } from '../board-hub-copy';
import type { BoardOffice } from '../schemas';

interface OfficeFlagsProps {
  office: BoardOffice;
}

export const OfficeFlags: FC<OfficeFlagsProps> = ({ office }) => {
  const website = office.isPublic ? (
    <KkRoster.Flag icon="visibility" label={PUBLIC_FLAG} />
  ) : (
    <KkRoster.Flag icon="visibilityOff" label={OFFLINE_FLAG} />
  );
  const role =
    office.impliedRoleName === null ? null : (
      <KkRoster.Flag
        icon="key"
        label={toRoleFlag(office.impliedRoleName)}
        text={office.impliedRoleName}
      />
    );

  return (
    <>
      {role}
      {website}
    </>
  );
};
