import type { KkIconName } from '../KkIcon';

export interface KkShellDestination {
  id: string;
  label: string;
  icon: KkIconName;
  activeIcon: KkIconName;
  to: string;
}
