import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import type { FC } from 'react';
import type { HoldingFormTarget } from '../hooks/use-holding-form-target';
import { CLOSE_LABEL, OPEN_HOLDING_TITLE } from '../roles-hub-copy';
import type { RoleSummary } from '../schemas';
import { HoldingFormPane } from './HoldingFormPane';

const PANE_SPAN = 5;

interface HoldingFormHostProps {
  target: HoldingFormTarget | null;
  roles: readonly RoleSummary[];
  isWide: boolean;
  today: string;
  onClose: () => void;
}

export const HoldingFormHost: FC<HoldingFormHostProps> = ({
  target,
  roles,
  isWide,
  today,
  onClose,
}) => {
  if (target === null) {
    return null;
  }

  if (isWide) {
    return (
      <KkMasterDetail.Detail span={PANE_SPAN}>
        <HoldingFormPane target={target} roles={roles} today={today} framed onClose={onClose} />
      </KkMasterDetail.Detail>
    );
  }

  return (
    <KkBottomDrawer open label={OPEN_HOLDING_TITLE} closeLabel={CLOSE_LABEL} onClose={onClose}>
      <HoldingFormPane
        target={target}
        roles={roles}
        today={today}
        framed={false}
        onClose={onClose}
      />
    </KkBottomDrawer>
  );
};
