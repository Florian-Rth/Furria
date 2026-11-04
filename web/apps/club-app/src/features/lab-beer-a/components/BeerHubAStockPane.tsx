import { KkAlert } from '@furria/ui/KkAlert';
import { KkButton } from '@furria/ui/KkButton';
import { KkChoiceChips } from '@furria/ui/KkChoiceChips';
import { KkNumberField } from '@furria/ui/KkNumberField';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkTabFigure } from '@furria/ui/KkTabFigure';
import { KkTabLedger } from '@furria/ui/KkTabLedger';
import { KkTabRunway } from '@furria/ui/KkTabRunway';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { LabBeerRefusal } from '@/features/lab-beer/beer-lab-actions';
import { WARNING_HORIZON_DAYS } from '@/features/lab-beer/beer-lab-ledger';
import type { LabBeerCorrectionReason, LabBeerWorld } from '@/features/lab-beer/beer-lab-types';
import {
  CORRECTION_COUNT,
  CORRECTION_DIRECTION,
  CORRECTION_DIRECTIONS,
  CORRECTION_REASON,
  CORRECTION_REASONS,
  CORRECTION_TITLE,
  correctionBook,
  cratesLabel,
  DELIVERY_COUNT,
  DELIVERY_TITLE,
  deliveryBook,
  emptyOnLabel,
  MOVEMENT_KINDS,
  MOVEMENTS_LABEL,
  MOVEMENTS_TITLE,
  movementAmount,
  NO_FORECAST,
  REASON_LABELS,
  REFUSALS,
  RUNWAY_END,
  RUNWAY_HORIZON,
  RUNWAY_LABEL,
  RUNWAY_START,
  STEP_LABELS,
  STOCK_NOW,
  stockDays,
  stockNowDetail,
} from '../beer-a-copy';
import { dayOf, paceOfDay } from '../beer-a-format';
import type { BeerAStockView } from '../beer-a-queue';
import { recentMovementsOf } from '../beer-a-queue';
import { useStockForms } from '../hooks/use-stock-forms';

const RUNWAY_SPAN_DAYS = 14;

const refusalText = (refusal: LabBeerRefusal): string => REFUSALS[refusal];

interface BeerHubAStockPaneProps {
  world: LabBeerWorld;
  view: BeerAStockView;
  deliver: (count: number) => LabBeerRefusal | null;
  correct: (count: number, reason: LabBeerCorrectionReason) => LabBeerRefusal | null;
}

export const BeerHubAStockPane: FC<BeerHubAStockPaneProps> = ({
  world,
  view,
  deliver,
  correct,
}) => {
  const forms = useStockForms(deliver, correct, refusalText);
  const emptyDay = view.emptyOn === null ? null : emptyOnLabel(dayOf(view.emptyOn));
  const detail = view.pacePerDay > 0 ? stockNowDetail(paceOfDay(view.pacePerDay)) : NO_FORECAST;
  const runwayLabel = RUNWAY_LABEL(view.daysLeft === null ? '' : stockDays(view.daysLeft));
  const movements = recentMovementsOf(world).map((movement) => {
    const reason = movement.reason === null ? '' : ` · ${REASON_LABELS[movement.reason]}`;

    return (
      <KkTabLedger.Line
        key={movement.id}
        state={movement.count > 0 ? 'stockIn' : 'stockOut'}
        day={dayOf(movement.bookedAt)}
        label={`${MOVEMENT_KINDS[movement.kind]}${reason}`}
        amount={movementAmount(movement.count)}
      />
    );
  });
  const outcome =
    forms.outcome === null ? null : (
      <KkAlert severity={forms.outcome.refused ? 'warning' : 'success'}>
        {forms.outcome.text}
      </KkAlert>
    );
  const direction = forms.canChooseDirection ? (
    <KkChoiceChips
      label={CORRECTION_DIRECTION}
      choices={CORRECTION_DIRECTIONS}
      value={forms.direction}
      onChange={forms.chooseDirection}
    />
  ) : null;

  return (
    <Stack sx={{ gap: 2.5, minWidth: 0 }}>
      <Stack sx={{ gap: 1.5, minWidth: 0 }}>
        <KkTabFigure
          label={STOCK_NOW}
          value={cratesLabel(view.stock)}
          detail={detail}
          attention={view.warns ? emptyDay : null}
          size="small"
        />
        <KkTabRunway
          label={runwayLabel}
          daysLeft={view.daysLeft}
          spanDays={RUNWAY_SPAN_DAYS}
          horizonDays={WARNING_HORIZON_DAYS}
          warns={view.warns}
          startLabel={RUNWAY_START}
          horizonLabel={RUNWAY_HORIZON}
          endLabel={RUNWAY_END}
        />
      </Stack>
      {outcome}
      <KkPanelSection title={DELIVERY_TITLE}>
        <KkNumberField
          name="delivery-count"
          label={DELIVERY_COUNT}
          value={forms.deliveryText}
          onChange={forms.changeDelivery}
          stepLabels={STEP_LABELS}
          min={1}
        />
        <KkButton fullWidth disabled={forms.deliveryCount === 0} onClick={forms.deliver}>
          {deliveryBook(forms.deliveryCount)}
        </KkButton>
      </KkPanelSection>
      <KkPanelSection title={CORRECTION_TITLE}>
        <KkChoiceChips
          label={CORRECTION_REASON}
          choices={CORRECTION_REASONS}
          value={forms.reason}
          onChange={forms.chooseReason}
        />
        {direction}
        <KkNumberField
          name="correction-count"
          label={CORRECTION_COUNT}
          value={forms.correctionText}
          onChange={forms.changeCorrection}
          stepLabels={STEP_LABELS}
          min={1}
        />
        <KkButton
          variant="outlined"
          fullWidth
          disabled={forms.correctionCount === 0}
          onClick={forms.correct}
        >
          {correctionBook(forms.correctionCount, forms.direction === 'less')}
        </KkButton>
      </KkPanelSection>
      <KkPanelSection title={MOVEMENTS_TITLE}>
        <KkTabLedger label={MOVEMENTS_LABEL}>{movements}</KkTabLedger>
      </KkPanelSection>
    </Stack>
  );
};
