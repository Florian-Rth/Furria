import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import type { StudioSetupRow } from '@/features/act-studio/hooks/use-studio-setup';
import { setupLaneLabelOf } from '@/features/act-studio/setup-copy';

interface DeskLaneSetupProps {
  row: StudioSetupRow;
}

export const DeskLaneSetup: FC<DeskLaneSetupProps> = ({ row }) => {
  const state = row.state === 'next' ? 'next' : 'later';
  const label = setupLaneLabelOf(row.number, row.total, row.actionText);
  const locked = !row.ready;

  return (
    <KkTimeline.LaneSetup
      number={row.number}
      text={row.actionText}
      hint={row.hint}
      label={label}
      state={state}
      disabled={locked}
      onPress={row.act}
    />
  );
};
