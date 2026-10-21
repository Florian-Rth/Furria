import type { KkDateQuickChoice } from '@furria/ui';
import {
  KkAlert,
  KkButton,
  KkDateField,
  KkNote,
  KkSeatLine,
  KkSeatList,
  KkStepPane,
} from '@furria/ui';
import type { FC } from 'react';
import { toAvatarHonours } from '@/lib/honours';
import { toInitials } from '@/lib/initials';
import { useHoldingEnding } from '../hooks/use-holding-ending';
import { toEndQuickChoices, toPersonName } from '../manage-roles-labels';
import { holderPhaseOf } from '../roles-hub';
import {
  END_HINT,
  END_HOLDING_TITLE,
  END_LABEL,
  SUBMIT_END,
  toHolderPeriod,
} from '../roles-hub-copy';
import type { RoleHolder, RoleSummary } from '../schemas';
import { HoldingPaneHead } from './HoldingPaneHead';

interface HoldingEndPaneProps {
  role: RoleSummary;
  holder: RoleHolder;
  today: string;
  framed: boolean;
  onClose: () => void;
}

export const HoldingEndPane: FC<HoldingEndPaneProps> = ({
  role,
  holder,
  today,
  framed,
  onClose,
}) => {
  const control = useHoldingEnding(role, holder, today, onClose);
  const quickChoices: KkDateQuickChoice[] = toEndQuickChoices(new Date());
  const consequence =
    control.consequence === null ? null : <KkNote tone="info">{control.consequence}</KkNote>;
  const rejection =
    control.rejection === null ? null : <KkAlert severity="error">{control.rejection}</KkAlert>;
  const period = toHolderPeriod(holder, holderPhaseOf(holder, today));
  const initials = toInitials(holder.firstName, holder.lastName);
  const honours = toAvatarHonours(holder.honours);
  const name = toPersonName(holder);

  return (
    <KkStepPane label={END_HOLDING_TITLE} framed={framed}>
      <HoldingPaneHead role={role} task={END_HOLDING_TITLE} closable={framed} onClose={onClose} />
      <KkStepPane.Body>
        <KkSeatList label={END_HOLDING_TITLE}>
          <KkSeatLine initials={initials} honours={honours} name={name} period={period} />
        </KkSeatList>
        <KkDateField
          name="endedOn"
          label={END_LABEL}
          value={control.endedOn}
          onChange={control.setEndedOn}
          quickChoices={quickChoices}
          required
          error={control.endedOnError !== undefined}
          helperText={control.endedOnError}
          hint={END_HINT}
        />
        {consequence}
        {rejection}
      </KkStepPane.Body>
      <KkStepPane.Foot>
        <KkButton
          variant="contained"
          tone="danger"
          fullWidth
          loading={control.isSaving}
          onClick={control.submit}
        >
          {SUBMIT_END}
        </KkButton>
      </KkStepPane.Foot>
    </KkStepPane>
  );
};
