import { KkLaneTrack } from '@furria/ui/KkLaneTrack';
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
    <KkLaneTrack.Setup
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
