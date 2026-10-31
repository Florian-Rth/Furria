import { KkMeta } from '@furria/ui/KkMeta';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkSeatList } from '@furria/ui/KkSeatList';
import { KkSkeletonRow } from '@furria/ui/KkSkeletonRow';
import type { FC } from 'react';
import type { HoldingTask } from '../hooks/use-holding-form-target';
import type { RoleHolder } from '../schemas';
import { RoleHolderLine } from './RoleHolderLine';

const SKELETON_ROWS = 2;

interface RoleHolderGroupProps {
  title: string;
  holders: readonly RoleHolder[];
  emptyNote?: string;
  pending: boolean;
  today: string;
  editable: boolean;
  onTask: (roleHoldingId: number, task: HoldingTask) => void;
}

export const RoleHolderGroup: FC<RoleHolderGroupProps> = ({
  title,
  holders,
  emptyNote,
  pending,
  today,
  editable,
  onTask,
}) => {
  if (pending) {
    return (
      <KkPanelSection title={title}>
        <KkSkeletonRow count={SKELETON_ROWS} />
      </KkPanelSection>
    );
  }
  if (holders.length === 0 && emptyNote === undefined) {
    return null;
  }

  const lines = holders.map((holder) => (
    <RoleHolderLine
      key={holder.roleHoldingId}
      holder={holder}
      today={today}
      editable={editable}
      onTask={onTask}
    />
  ));
  const body =
    holders.length === 0 ? (
      <KkMeta>{emptyNote}</KkMeta>
    ) : (
      <KkSeatList label={title}>{lines}</KkSeatList>
    );

  return <KkPanelSection title={title}>{body}</KkPanelSection>;
};
