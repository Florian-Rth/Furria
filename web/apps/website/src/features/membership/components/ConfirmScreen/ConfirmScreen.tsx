import { KkLead } from '@furria/ui';
import { ConfirmScreenActions } from './internal/layout/ConfirmScreenActions';
import { ConfirmScreenRoot } from './internal/layout/ConfirmScreenRoot';
import { ConfirmScreenProgress } from './internal/ui/ConfirmScreenProgress';
import { ConfirmScreenTitle } from './internal/ui/ConfirmScreenTitle';

export const ConfirmScreen = Object.assign(ConfirmScreenRoot, {
  Title: ConfirmScreenTitle,
  Lead: KkLead,
  Progress: ConfirmScreenProgress,
  Actions: ConfirmScreenActions,
});
