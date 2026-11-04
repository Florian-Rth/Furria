import { KkAlert } from '@furria/ui/KkAlert';
import { KkButton } from '@furria/ui/KkButton';
import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkLedgerList } from '@furria/ui/KkLedgerList';
import { KkLedgerRow } from '@furria/ui/KkLedgerRow';
import { KkLedgerStatus } from '@furria/ui/KkLedgerStatus';
import { KkNumberField } from '@furria/ui/KkNumberField';
import type { KkSelectOption } from '@furria/ui/KkSelectField';
import { KkSelectField } from '@furria/ui/KkSelectField';
import { KkStepPane } from '@furria/ui/KkStepPane';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import { labBeerPersonOf } from '@/features/lab-beer/beer-lab-fixture';
import type { LabBeerWorldState } from '@/features/lab-beer/use-lab-beer-world';
import { useHubStock } from '../hooks/use-hub-stock';
import {
  CORRECTION_ACTION,
  CORRECTION_FIELD,
  CORRECTION_REASON,
  CORRECTION_TITLE,
  DELIVERY_ACTION,
  DELIVERY_FIELD,
  DELIVERY_TITLE,
  forecastText,
  HISTORY_COLUMNS,
  HISTORY_LABEL,
  MOVEMENT_KINDS,
  REASONS,
  STEP_LABELS,
  STOCK_TITLE,
  stockContext,
} from '../ledger-copy';
import { dayOf, paceLabelOf, signedOf, timeOf, weekdayDayOf } from '../ledger-format';
import type { HubHealth } from '../ledger-hub';

const REASON_OPTIONS: readonly KkSelectOption[] = [
  { value: 'shrinkage', label: REASONS.shrinkage },
  { value: 'breakage', label: REASONS.breakage },
  { value: 'miscount', label: REASONS.miscount },
];

const FIELD_SIZE = { xs: 12, sm: 6 } as const;
const CORRECTION_MIN = -99;
const CORRECTION_MAX = 99;

interface HubStockPaneProps {
  beer: LabBeerWorldState;
  health: HubHealth;
  operatorId: number;
  framed: boolean;
  close: ReactNode;
}

export const HubStockPane: FC<HubStockPaneProps> = ({
  beer,
  health,
  operatorId,
  framed,
  close,
}) => {
  const stock = useHubStock(beer, operatorId);
  const { forecast } = health;
  const emptyDay = forecast.emptyOn === null ? null : weekdayDayOf(forecast.emptyOn);
  const forecastLine = forecastText(
    health.windowCrates,
    paceLabelOf(forecast.pacePerDay),
    emptyDay,
  );
  const forecastState = forecast.warns ? 'overdue' : 'open';
  const context = stockContext(health.stock);
  const refusal =
    stock.refusal === null ? null : <KkAlert severity="warning">{stock.refusal}</KkAlert>;
  const rows = stock.lines.map((line) => {
    const { movement } = line;
    const reason = movement.reason === null ? '' : `${REASONS[movement.reason]} · `;
    const by = labBeerPersonOf(movement.bookedById)?.firstName ?? '';
    const state = movement.kind === 'delivery' ? 'done' : 'open';
    const day = dayOf(movement.bookedAt);
    const time = timeOf(movement.bookedAt);
    const label = MOVEMENT_KINDS[movement.kind];
    const meta = `${reason}${by}`;
    const amount = signedOf(movement.count);
    const balance = String(line.stockAfter);
    const fresh = movement.id === stock.freshId;

    return (
      <KkLedgerRow
        key={movement.id}
        kind="crate"
        rail="none"
        day={day}
        time={time}
        state={state}
        stateLabel={label}
        meta={meta}
        amount={amount}
        balance={balance}
        fresh={fresh}
      />
    );
  });

  return (
    <KkStepPane label={STOCK_TITLE} framed={framed}>
      <KkStepPane.Head
        icon="archive"
        title={STOCK_TITLE}
        context={context}
        state={forecastState}
        stateLabel=""
        actions={close}
      />
      <KkStepPane.Body>
        <KkLedgerStatus state={forecastState} text={forecastLine} />
        {refusal}
        <Stack component="section" aria-label={DELIVERY_TITLE} sx={{ gap: 1 }}>
          <KkEyebrow>{DELIVERY_TITLE}</KkEyebrow>
          <Grid container spacing={1} sx={{ alignItems: 'center' }}>
            <Grid size={FIELD_SIZE}>
              <KkNumberField
                name="delivery"
                label={DELIVERY_FIELD}
                value={stock.delivery}
                onChange={stock.setDelivery}
                stepLabels={STEP_LABELS}
                min={1}
                max={CORRECTION_MAX}
              />
            </Grid>
            <Grid size={FIELD_SIZE}>
              <KkButton variant="outlined" fullWidth onClick={stock.confirmDelivery}>
                {DELIVERY_ACTION}
              </KkButton>
            </Grid>
          </Grid>
        </Stack>
        <Stack component="section" aria-label={CORRECTION_TITLE} sx={{ gap: 1 }}>
          <KkEyebrow>{CORRECTION_TITLE}</KkEyebrow>
          <Grid container spacing={1} sx={{ alignItems: 'center' }}>
            <Grid size={FIELD_SIZE}>
              <KkNumberField
                name="correction"
                label={CORRECTION_FIELD}
                value={stock.correction}
                onChange={stock.setCorrection}
                stepLabels={STEP_LABELS}
                min={CORRECTION_MIN}
                max={CORRECTION_MAX}
              />
            </Grid>
            <Grid size={FIELD_SIZE}>
              <KkSelectField
                name="reason"
                label={CORRECTION_REASON}
                value={stock.reason}
                options={REASON_OPTIONS}
                presentation="choices"
                onChange={stock.setReason}
              />
            </Grid>
          </Grid>
          <KkButton variant="outlined" fullWidth onClick={stock.confirmCorrection}>
            {CORRECTION_ACTION}
          </KkButton>
        </Stack>
        <KkLedgerList label={HISTORY_LABEL} columns={HISTORY_COLUMNS}>
          {rows}
        </KkLedgerList>
      </KkStepPane.Body>
    </KkStepPane>
  );
};
