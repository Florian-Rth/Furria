import type { KkDateQuickChoice } from '@furria/ui';
import { KkAlert, KkButton, KkDateField, KkMeta, KkNote, KkStepPane } from '@furria/ui';
import type { FC } from 'react';
import { PersonPicker } from '@/features/group-hub';
import { useHoldingOpening } from '../hooks/use-holding-opening';
import { toStartQuickChoices } from '../manage-roles-labels';
import {
  OPEN_HOLDING_TITLE,
  PICKER_NOTE,
  SINCE_HINT,
  SINCE_LABEL,
  SUBMIT_OPEN,
} from '../roles-hub-copy';
import type { RoleSummary } from '../schemas';
import { HoldingPaneHead } from './HoldingPaneHead';

interface HoldingOpenPaneProps {
  role: RoleSummary;
  today: string;
  framed: boolean;
  onClose: () => void;
}

export const HoldingOpenPane: FC<HoldingOpenPaneProps> = ({ role, today, framed, onClose }) => {
  const control = useHoldingOpening(role, today, onClose);
  const quickChoices: KkDateQuickChoice[] = toStartQuickChoices(new Date());
  const personError =
    control.personError === undefined ? null : <KkMeta tone="accent">{control.personError}</KkMeta>;
  const consequence =
    control.consequence === null ? null : <KkNote tone="info">{control.consequence}</KkNote>;
  const rejection =
    control.rejection === null ? null : <KkAlert severity="error">{control.rejection}</KkAlert>;

  return (
    <KkStepPane label={OPEN_HOLDING_TITLE} framed={framed}>
      <HoldingPaneHead role={role} task={OPEN_HOLDING_TITLE} closable={framed} onClose={onClose} />
      <KkStepPane.Body>
        <PersonPicker
          selected={control.person}
          onSelect={control.select}
          onClear={control.clearPerson}
          note={PICKER_NOTE}
        />
        {personError}
        <KkDateField
          name="sinceOn"
          label={SINCE_LABEL}
          value={control.sinceOn}
          onChange={control.setSinceOn}
          quickChoices={quickChoices}
          required
          error={control.sinceOnError !== undefined}
          helperText={control.sinceOnError}
          hint={SINCE_HINT}
        />
        {consequence}
        {rejection}
      </KkStepPane.Body>
      <KkStepPane.Foot>
        <KkButton variant="contained" fullWidth loading={control.isSaving} onClick={control.submit}>
          {SUBMIT_OPEN}
        </KkButton>
      </KkStepPane.Foot>
    </KkStepPane>
  );
};
