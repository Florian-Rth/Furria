import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkOfficeHead } from '@furria/ui/KkOfficeHead';
import { KkOfficeMark } from '@furria/ui/KkOfficeMark';
import type { FC } from 'react';
import { CLOSE_LABEL } from '../board-hub-copy';
import type { BoardOffice } from '../schemas';

interface SeatPaneHeadProps {
  office: BoardOffice;
  task: string;
  closable: boolean;
  onClose: () => void;
}

export const SeatPaneHead: FC<SeatPaneHeadProps> = ({ office, task, closable, onClose }) => {
  const mark = <KkOfficeMark icon={office.icon} state="held" />;
  const facts = <KkMeta>{task}</KkMeta>;
  const actions = closable ? (
    <KkIconButton label={CLOSE_LABEL} icon="close" size="small" onClick={onClose} />
  ) : undefined;

  return <KkOfficeHead mark={mark} title={office.name} facts={facts} actions={actions} />;
};
