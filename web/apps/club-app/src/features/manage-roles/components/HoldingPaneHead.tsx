import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkOfficeHead } from '@furria/ui/KkOfficeHead';
import { KkRoleMark } from '@furria/ui/KkRoleMark';
import type { FC } from 'react';
import { toRoleMarkState } from '../roles-hub';
import { CLOSE_LABEL } from '../roles-hub-copy';
import type { RoleSummary } from '../schemas';

interface HoldingPaneHeadProps {
  role: RoleSummary;
  task: string;
  closable: boolean;
  onClose: () => void;
}

export const HoldingPaneHead: FC<HoldingPaneHeadProps> = ({ role, task, closable, onClose }) => {
  const mark = <KkRoleMark coin={role.coin} state={toRoleMarkState(role)} />;
  const facts = <KkMeta>{task}</KkMeta>;
  const actions = closable ? (
    <KkIconButton label={CLOSE_LABEL} icon="close" size="small" onClick={onClose} />
  ) : undefined;

  return <KkOfficeHead mark={mark} title={role.name} facts={facts} actions={actions} />;
};
