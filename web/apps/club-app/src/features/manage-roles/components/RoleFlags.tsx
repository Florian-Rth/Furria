import { KkRoster } from '@furria/ui';
import type { FC } from 'react';
import type { RoleFacts } from '../roles-hub';
import { toBoardFlag } from '../roles-hub-copy';
import { RoleRightsFlag } from './RoleRightsFlag';

interface RoleFlagsProps {
  role: RoleFacts;
  totalKeys: number;
}

export const RoleFlags: FC<RoleFlagsProps> = ({ role, totalKeys }) => {
  const boardFlag = toBoardFlag(role);
  const board =
    boardFlag === null ? null : (
      <KkRoster.Flag icon="board" label={boardFlag.label} text={boardFlag.text} persistent />
    );

  return (
    <>
      <RoleRightsFlag role={role} totalKeys={totalKeys} />
      {board}
    </>
  );
};
