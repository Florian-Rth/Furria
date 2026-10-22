import { KkButton } from '@furria/ui/KkButton';
import { KkRoleMark } from '@furria/ui/KkRoleMark';
import type { FC } from 'react';
import type { RoleLike } from '../roles-hub';
import { toRoleMarkState } from '../roles-hub';
import type { RolePaneTab } from '../schemas';

interface RightRoleChipProps {
  role: RoleLike;
  selected: boolean;
  onOpen: (roleId: number, tab?: RolePaneTab) => void;
}

export const RightRoleChip: FC<RightRoleChipProps> = ({ role, selected, onOpen }) => {
  const open = (): void => {
    onOpen(role.roleId, 'rights');
  };
  const mark = <KkRoleMark coin={role.coin} state={toRoleMarkState(role)} size="xsmall" />;

  return (
    <KkButton
      size="small"
      variant={selected ? 'contained' : 'outlined'}
      startIcon={mark}
      onClick={open}
    >
      {role.name}
    </KkButton>
  );
};
