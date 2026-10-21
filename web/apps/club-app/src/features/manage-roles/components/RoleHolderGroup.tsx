import { KkMeta, KkPanelSection, KkSeatList, KkSkeletonRow } from '@furria/ui';
import type { FC } from 'react';
import type { RoleHolder } from '../schemas';
import { RoleHolderLine } from './RoleHolderLine';

const SKELETON_ROWS = 2;

interface RoleHolderGroupProps {
  title: string;
  holders: readonly RoleHolder[];
  emptyNote?: string;
  pending: boolean;
  today: string;
  canEnd: boolean;
  onEnd: (roleHoldingId: number) => void;
}

export const RoleHolderGroup: FC<RoleHolderGroupProps> = ({
  title,
  holders,
  emptyNote,
  pending,
  today,
  canEnd,
  onEnd,
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
      canEnd={canEnd}
      onEnd={onEnd}
    />
  ));
  const count = holders.length === 0 ? undefined : holders.length;
  const body =
    holders.length === 0 ? (
      <KkMeta>{emptyNote}</KkMeta>
    ) : (
      <KkSeatList label={title}>{lines}</KkSeatList>
    );

  return (
    <KkPanelSection title={title} meta={count}>
      {body}
    </KkPanelSection>
  );
};
