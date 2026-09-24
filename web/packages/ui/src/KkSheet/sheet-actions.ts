import type { ElementType } from 'react';
import type { KkButtonTone } from '../KkButton';

export interface KkSheetAction {
  label: string;
  onClick?: () => void;
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  tone?: KkButtonTone;
  disabled?: boolean;
  loading?: boolean;
  ariaLabel?: string;
}
