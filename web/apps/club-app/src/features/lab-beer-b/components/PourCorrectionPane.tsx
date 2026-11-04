import { KkButton } from '@furria/ui/KkButton';
import { KkNumberField } from '@furria/ui/KkNumberField';
import { KkSelectField } from '@furria/ui/KkSelectField';
import type { FC, ReactNode } from 'react';
import type { LabBeerCorrectionReason } from '@/features/lab-beer/beer-lab-types';
import type { PourHub } from '../hooks/use-pour-hub';
import { usePourStockForm } from '../hooks/use-pour-stock-form';
import { REASON_LABELS } from '../pour-copy';
import type { PourCorrectionDirection } from '../pour-hub';
import {
  COUNT_FIELD_LABEL,
  correctionButtonOf,
  DIRECTION_LABEL,
  DIRECTION_LESS,
  DIRECTION_MORE,
  REASON_LABEL,
  STEP_LABELS,
  stockAfterOf,
} from '../pour-hub-copy';
import { PourFormFrame } from './PourFormFrame';

const REASONS: readonly LabBeerCorrectionReason[] = ['shrinkage', 'breakage', 'miscount'];

const REASON_OPTIONS = REASONS.map((reason) => ({ value: reason, label: REASON_LABELS[reason] }));

const DIRECTION_OPTIONS = [
  { value: 'less', label: DIRECTION_LESS },
  { value: 'more', label: DIRECTION_MORE },
];

const isReason = (value: string): value is LabBeerCorrectionReason =>
  REASONS.some((reason) => reason === value);

const isDirection = (value: string): value is PourCorrectionDirection =>
  value === 'less' || value === 'more';

interface PourCorrectionPaneProps {
  hub: PourHub;
  framed: boolean;
  actions: ReactNode;
}

export const PourCorrectionPane: FC<PourCorrectionPaneProps> = ({ hub, framed, actions }) => {
  const form = usePourStockForm('1');
  const hint = stockAfterOf(hub.summary.stock, form.delta);
  const buttonLabel = correctionButtonOf(form.delta);
  const chooseReason = (value: string): void => {
    if (isReason(value)) {
      form.setReason(value);
    }
  };
  const chooseDirection = (value: string): void => {
    if (isDirection(value)) {
      form.setDirection(value);
    }
  };
  const book = (): void => {
    if (hub.correction(form.delta, form.reason)) {
      hub.closeSide();
    }
  };
  const direction =
    form.reason === 'miscount' ? (
      <KkSelectField
        name="direction"
        label={DIRECTION_LABEL}
        value={form.direction}
        options={DIRECTION_OPTIONS}
        presentation="choices"
        onChange={chooseDirection}
      />
    ) : null;

  return (
    <PourFormFrame form="correction" framed={framed} actions={actions} refusal={hub.refusal}>
      <KkSelectField
        name="reason"
        label={REASON_LABEL}
        value={form.reason}
        options={REASON_OPTIONS}
        presentation="choices"
        onChange={chooseReason}
      />
      {direction}
      <KkNumberField
        name="correction"
        label={COUNT_FIELD_LABEL}
        value={form.countText}
        onChange={form.setCountText}
        stepLabels={STEP_LABELS}
        min={1}
        hint={hint}
      />
      <KkButton variant="contained" size="large" disabled={form.delta === 0} onClick={book}>
        {buttonLabel}
      </KkButton>
    </PourFormFrame>
  );
};
