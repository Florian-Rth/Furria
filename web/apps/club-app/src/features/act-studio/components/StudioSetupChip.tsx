import { KkLaneProgress } from '@furria/ui/KkLaneProgress';
import type { FC } from 'react';
import type { StudioSetup } from '../hooks/use-studio-setup';

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
