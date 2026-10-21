import type { KkDateQuickChoice } from '@furria/ui';
import { KkAlert, KkButton, KkDateField, KkMeta, KkNote, KkStepPane } from '@furria/ui';
import type { FC } from 'react';
import { PersonPicker } from '@/features/group-hub';
import {
  OPEN_SEAT_TITLE,
  PICKER_NOTE,
  SINCE_LABEL,
  SUBMIT_OPEN,
  TODAY_CHOICE,
  toDayChoice,
} from '../board-hub-copy';
import { useSeatOpening } from '../hooks/use-seat-opening';
import type { BoardOffice } from '../schemas';
import { SeatPaneHead } from './SeatPaneHead';

interface SeatOpenPaneProps {
  office: BoardOffice;
  defaultSinceOn: string;
  today: string;
  framed: boolean;
  onClose: () => void;
}

export const SeatOpenPane: FC<SeatOpenPaneProps> = ({
  office,
  defaultSinceOn,
  today,
  framed,
  onClose,
}) => {
  const control = useSeatOpening(office, defaultSinceOn, today, onClose);
  const followUp: KkDateQuickChoice[] =
    defaultSinceOn === today
      ? []
      : [{ label: toDayChoice(defaultSinceOn, today), value: defaultSinceOn }];
  const quickChoices: KkDateQuickChoice[] = [...followUp, { label: TODAY_CHOICE, value: today }];
  const personError =
    control.personError === undefined ? null : <KkMeta tone="accent">{control.personError}</KkMeta>;
  const consequence =
    control.consequence === null ? null : <KkNote tone="info">{control.consequence}</KkNote>;
  const rejection =
    control.rejection === null ? null : <KkAlert severity="error">{control.rejection}</KkAlert>;

  return (
    <KkStepPane label={OPEN_SEAT_TITLE} framed={framed}>
      <SeatPaneHead office={office} task={OPEN_SEAT_TITLE} closable={framed} onClose={onClose} />
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
