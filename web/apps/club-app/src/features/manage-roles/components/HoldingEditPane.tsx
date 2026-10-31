import { KkAlert } from '@furria/ui/KkAlert';
import { KkButton } from '@furria/ui/KkButton';
import { KkDateField } from '@furria/ui/KkDateField';
import { KkSeatLine } from '@furria/ui/KkSeatLine';
import { KkSeatList } from '@furria/ui/KkSeatList';
import { KkStepPane } from '@furria/ui/KkStepPane';
import type { FC } from 'react';
import { toAvatarHonours } from '@/lib/honours';
import { toInitials } from '@/lib/initials';
import { useHoldingCorrection } from '../hooks/use-holding-correction';
import { toPersonName } from '../manage-roles-labels';
import { holderPhaseOf } from '../roles-hub';
import {
  EDIT_HOLDING_TITLE,
  END_LABEL,
  SINCE_LABEL,
  SUBMIT_CORRECT,
  toHolderPeriod,
  UNTIL_EMPTY_LABEL,
  UNTIL_HINT,
} from '../roles-hub-copy';
import type { RoleHolder, RoleSummary } from '../schemas';
import { HoldingPaneHead } from './HoldingPaneHead';

interface HoldingEditPaneProps {
  role: RoleSummary;
  holder: RoleHolder;
  today: string;
  framed: boolean;
  onClose: () => void;
}

export const HoldingEditPane: FC<HoldingEditPaneProps> = ({
  role,
  holder,
  today,
  framed,
  onClose,
}) => {
  const control = useHoldingCorrection(role, holder, onClose);
  const rejection =
    control.rejection === null ? null : <KkAlert severity="error">{control.rejection}</KkAlert>;
  const period = toHolderPeriod(holder, holderPhaseOf(holder, today));
  const initials = toInitials(holder.firstName, holder.lastName);
  const honours = toAvatarHonours(holder.honours);
  const name = toPersonName(holder);

  return (
    <KkStepPane label={EDIT_HOLDING_TITLE} framed={framed}>
      <HoldingPaneHead role={role} task={EDIT_HOLDING_TITLE} closable={framed} onClose={onClose} />
      <KkStepPane.Body>
        <KkSeatList label={EDIT_HOLDING_TITLE}>
          <KkSeatLine initials={initials} honours={honours} name={name} period={period} />
        </KkSeatList>
        <KkDateField
          name="sinceOn"
          label={SINCE_LABEL}
          value={control.sinceOn}
          onChange={control.setSinceOn}
          required
          error={control.sinceOnError !== undefined}
          helperText={control.sinceOnError}
        />
        <KkDateField
          name="untilOn"
          label={END_LABEL}
          value={control.untilOn}
          onChange={control.setUntilOn}
          allowEmpty
          emptyLabel={UNTIL_EMPTY_LABEL}
          error={control.untilOnError !== undefined}
          helperText={control.untilOnError}
          hint={UNTIL_HINT}
        />
        {rejection}
      </KkStepPane.Body>
      <KkStepPane.Foot>
        <KkButton variant="contained" fullWidth loading={control.isSaving} onClick={control.submit}>
          {SUBMIT_CORRECT}
        </KkButton>
      </KkStepPane.Foot>
    </KkStepPane>
  );
};
