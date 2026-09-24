import type { ElementType } from 'react';
import type { KkIconName } from './KkIcon';

export type KkPanelActionEmphasis = 'strong' | 'quiet';

export interface KkPanelAction {
  label: string;
  emphasis?: KkPanelActionEmphasis;
  icon?: KkIconName;
  onClick?: () => void;
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  disabled?: boolean;
  ariaLabel?: string;
}
