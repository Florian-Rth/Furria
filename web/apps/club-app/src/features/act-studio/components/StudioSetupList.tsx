import { KkLaneChecklist } from '@furria/ui/KkLaneChecklist';
import type { FC } from 'react';
import type { StudioSetup } from '../hooks/use-studio-setup';
import { SETUP_TITLE } from '../setup-copy';

interface StudioSetupListProps {
  setup: StudioSetup;
}

export const StudioSetupList: FC<StudioSetupListProps> = ({ setup }) => {
  const rows = setup.rows.map((row) => (
    <KkLaneChecklist.Row
      key={row.key}
      index={row.number}
      state={row.state}
      stateText={row.stateText}
      glyph={row.glyph}
      title={row.title}
      fact={row.fact}
      actionText={row.actionText}
      disabled={!row.ready}
      onAction={row.act}
    />
  ));

  return (
    <KkLaneChecklist title={SETUP_TITLE} aside={setup.progressText}>
      {rows}
    </KkLaneChecklist>
  );
};
