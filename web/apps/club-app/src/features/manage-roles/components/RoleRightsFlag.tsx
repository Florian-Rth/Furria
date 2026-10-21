import { KkRoster } from '@furria/ui';
import type { FC } from 'react';
import type { RoleFacts } from '../roles-hub';
import { toRightsFlag } from '../roles-hub-copy';

interface RoleRightsFlagProps {
  role: RoleFacts;
  totalKeys: number;
}

export const RoleRightsFlag: FC<RoleRightsFlagProps> = ({ role, totalKeys }) => {
  const flag = toRightsFlag(role, totalKeys);

  return <KkRoster.Flag icon="key" label={flag.label} text={flag.text} persistent />;
};
