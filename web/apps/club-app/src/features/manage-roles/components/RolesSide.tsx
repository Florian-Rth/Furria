import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { HoldingFormTargetControl } from '../hooks/use-holding-form-target';
import type { PaneRequest } from '../hooks/use-roles-hub';
import { CLOSE_LABEL, OPEN_PAGE_LABEL, ROLE_PATH } from '../roles-hub-copy';
import type { RoleSummary } from '../schemas';
import { HoldingFormHost } from './HoldingFormHost';
import { RolePane } from './RolePane';

const PANE_SPAN = 5;

interface RolesSideProps {
  roles: readonly RoleSummary[];
  catalogue: readonly string[];
  selected: RoleSummary | null;
  request: PaneRequest;
  form: HoldingFormTargetControl;
  isWide: boolean;
  today: string;
  onClose: () => void;
}

export const RolesSide: FC<RolesSideProps> = ({
  roles,
  catalogue,
  selected,
  request,
  form,
  isWide,
  today,
  onClose,
}) => {
  if (form.target !== null || selected === null) {
    return (
      <HoldingFormHost
        target={form.target}
        roles={roles}
        isWide={isWide}
        today={today}
        onClose={form.close}
      />
    );
  }

  const params = { roleId: String(selected.roleId) };
  const paneKey = `${selected.roleId}-${request.nonce}`;
  const openPage = (
    <KkIconButton
      label={OPEN_PAGE_LABEL}
      icon="external"
      size="small"
      component={Link}
      to={ROLE_PATH}
      params={params}
    />
  );

  if (!isWide) {
    return (
      <KkBottomDrawer open label={selected.name} closeLabel={CLOSE_LABEL} onClose={onClose}>
        <RolePane
          key={paneKey}
          role={selected}
          catalogue={catalogue}
          today={today}
          requestedTab={request.tab}
          framed={false}
          surface="paper"
          actions={openPage}
          onAddHolder={form.openHolding}
          onEndHolder={form.endHolding}
        />
      </KkBottomDrawer>
    );
  }

  const actions = (
    <>
      {openPage}
      <KkIconButton label={CLOSE_LABEL} icon="close" size="small" onClick={onClose} />
    </>
  );

  return (
    <KkMasterDetail.Detail span={PANE_SPAN}>
      <RolePane
        key={paneKey}
        role={selected}
        catalogue={catalogue}
        today={today}
        requestedTab={request.tab}
        framed
        surface="paper"
        actions={actions}
        onAddHolder={form.openHolding}
        onEndHolder={form.endHolding}
      />
    </KkMasterDetail.Detail>
  );
};
