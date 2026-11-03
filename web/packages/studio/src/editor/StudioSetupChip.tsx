import type { StudioSetup } from '@furria/studio/studio-setup-view';
import { KkLaneProgress } from '@furria/ui/KkLaneProgress';
import type { FC } from 'react';

interface StudioSetupChipProps {
  setup: StudioSetup;
  expanded: boolean;
  onToggle: () => void;
}

export const StudioSetupChip: FC<StudioSetupChipProps> = ({ setup, expanded, onToggle }) => {
  if (!setup.shown) {
    return null;
  }

  return (
    <KkLaneProgress
      done={setup.setup.done}
      total={setup.setup.total}
      text={setup.progressText}
      label={setup.progressLabel}
      expanded={expanded}
      onPress={onToggle}
    />
  );
};
