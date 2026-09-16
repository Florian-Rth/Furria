import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, ReactNode } from 'react';
import { useId } from 'react';
import { inkWashSurface } from './internal/ink-wash';
import { applyScheme, schemeFill } from './internal/scheme-paint';
import { KkAlert } from './KkAlert';
import { KkButton } from './KkButton';
import { KkConsequenceNote } from './KkConsequenceNote';
import { KkFieldRow } from './KkFieldRow';
import type { KkIconName } from './KkIcon';
import { KkIcon } from './KkIcon';
import { KkModalFrame } from './KkModalFrame/KkModalFrame';
import { KkNote } from './KkNote';
import { KkPanel } from './KkPanel';

export interface KkConfirmFact {
  label: string;
  value: string;
}

type KkConfirmTone = 'neutral' | 'danger';

interface KkConfirmMark {
  icon: KkIconName;
  color: string;
  wash: (theme: Theme) => CSSObject;
}

const MARK_SIZE = 34;
const DANGER_WASH_LIGHT = '10%';
const DANGER_WASH_DARK = '18%';

const dangerWash = (theme: Theme): CSSObject => {
  const source = (theme.vars ?? theme).palette.error.main;
  const mix = (amount: string): string => `color-mix(in srgb, ${source} ${amount}, transparent)`;

  return applyScheme(theme, schemeFill(mix(DANGER_WASH_LIGHT), mix(DANGER_WASH_DARK)));
};

const toneMarks: Record<KkConfirmTone, KkConfirmMark> = {
  neutral: {
    icon: 'info',
    color: 'text.secondary',
    wash: (theme) => inkWashSurface(theme, '8%', '14%'),
  },
  danger: { icon: 'bolt', color: 'error.main', wash: dangerWash },
};

const confirmButtonTones: Record<KkConfirmTone, 'default' | 'danger'> = {
  neutral: 'default',
  danger: 'danger',
};

interface KkConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tone?: KkConfirmTone;
  eyebrow: string;
  question: string;
  explanation: string;
  fields?: ReactNode;
  facts: readonly KkConfirmFact[];
  consequence?: ReactNode;
  error?: string;
  confirmLabel: string;
  cancelLabel: string;
  closeLabel: string;
  busy?: boolean;
}

export const KkConfirmDialog: FC<KkConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  tone = 'neutral',
  eyebrow,
  question,
  explanation,
  fields,
  facts,
  consequence,
  error,
  confirmLabel,
  cancelLabel,
  closeLabel,
  busy,
}) => {
  const titleId = useId();
  const mark = toneMarks[tone];
  const factRows = facts.map((fact, index) => ({ ...fact, key: `${index}-${fact.label}` }));

  const fieldBlock =
    fields === undefined ? null : <KkModalFrame.Fields>{fields}</KkModalFrame.Fields>;

  const factsTable =
    factRows.length === 0 ? null : (
      <KkPanel variant="list" sx={{ mt: 1.75 }}>
        {factRows.map((row) => (
          <KkFieldRow key={row.key} label={row.label} value={row.value} />
        ))}
      </KkPanel>
    );

  const consequenceNote =
    consequence === undefined ? null : (
      <KkConsequenceNote sx={{ mt: 1.5 }}>{consequence}</KkConsequenceNote>
    );

  const errorAlert = error === undefined ? null : <KkAlert severity="error">{error}</KkAlert>;

  return (
    <KkModalFrame open={open} onClose={onClose} labelledBy={titleId} closeLabel={closeLabel}>
      <Stack direction="row" sx={{ minWidth: 0, gap: 1.375, alignItems: 'flex-start' }}>
        <Stack
          aria-hidden
          data-kk-confirm-dialog-mark
          sx={[
            {
              width: MARK_SIZE,
              height: MARK_SIZE,
              flexShrink: 0,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              color: mark.color,
            },
            mark.wash,
          ]}
        >
          <KkIcon name={mark.icon} size="small" />
        </Stack>
        <Stack sx={{ minWidth: 0, gap: 0.5 }}>
          <KkModalFrame.Kicker>{eyebrow}</KkModalFrame.Kicker>
          <KkModalFrame.Title id={titleId}>{question}</KkModalFrame.Title>
        </Stack>
      </Stack>
      <KkModalFrame.Body>
        <KkNote>{explanation}</KkNote>
      </KkModalFrame.Body>
      {fieldBlock}
      {factsTable}
      {consequenceNote}
      <KkModalFrame.Footer>
        {errorAlert}
        <KkButton variant="outlined" onClick={onClose}>
          {cancelLabel}
        </KkButton>
        <KkButton tone={confirmButtonTones[tone]} loading={busy} onClick={onConfirm}>
          {confirmLabel}
        </KkButton>
      </KkModalFrame.Footer>
    </KkModalFrame>
  );
};
