import { KkToggleChips } from '@furria/ui/KkToggleChips';
import type { FC } from 'react';
import { GROUPS_LABEL } from '../intake-labels';

const SAMPLE_CHIPS = [
  { id: 'help-kids', label: 'Kindergarde' },
  { id: 'help-youth', label: 'Jugendgarde' },
  { id: 'help-show', label: 'Showtanz' },
] as const;
const SAMPLE_SELECTED = ['help-kids'] as const;

const keep = (): void => {};

export const IntakeEditorHelpGroupsPreview: FC = () => (
  <KkToggleChips
    label={GROUPS_LABEL}
    chips={SAMPLE_CHIPS}
    selected={SAMPLE_SELECTED}
    onToggle={keep}
  />
);
