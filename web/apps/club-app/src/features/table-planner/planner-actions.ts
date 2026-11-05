import type { KkButtonTone } from '@furria/ui/KkButton';
import type { KkIconName } from '@furria/ui/KkIcon';

export interface PlannerAction {
  id: string;
  label: string;
  icon: KkIconName;
  tone?: KkButtonTone;
  onClick: () => void;
}
