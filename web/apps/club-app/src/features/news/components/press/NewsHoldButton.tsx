import type { KkSx } from '@furria/ui';
import { KK_PRESS_BEATS_MS, KkConfirmDialog, KkHoldButton } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  CONFIRM_CANCEL,
  CONFIRM_CLOSE,
  FIRST_PUBLICATION_NOTE,
  HOLD_HINT,
  PRESS_CONFIRM_COPY,
  REPUBLISH_NOTE,
} from '../../press-copy';
import type { PressKind } from '../../press-run';
import { usePressConfirm } from './use-press-confirm';

const NO_FACTS = [] as const;

const noteOf = (kind: PressKind, firstPublication: boolean): string | null => {
  if (firstPublication) {
    return FIRST_PUBLICATION_NOTE;
  }
  return kind === 'republish' ? REPUBLISH_NOTE : null;
};

interface NewsHoldButtonProps {
  label: string;
  kind: PressKind;
  firstPublication: boolean;
  onPress: () => void;
  disabled?: boolean;
  sx?: KkSx;
}

export const NewsHoldButton: FC<NewsHoldButtonProps> = ({
  label,
  kind,
  firstPublication,
  onPress,
  disabled = false,
  sx,
}) => {
  const confirmation = usePressConfirm(onPress);
  const copy = PRESS_CONFIRM_COPY[kind];
  const consequence = copy.consequence ?? undefined;
  const note = noteOf(kind, firstPublication);

  return (
    <Stack sx={sx}>
      <KkHoldButton
        label={label}
        hint={HOLD_HINT}
        note={note}
        holdMs={KK_PRESS_BEATS_MS.hold}
        disabled={disabled}
        onHold={onPress}
        onAssistiveActivate={confirmation.ask}
      />
      <KkConfirmDialog
        open={confirmation.open}
        onClose={confirmation.close}
        onConfirm={confirmation.confirm}
        eyebrow={copy.eyebrow}
        question={copy.question}
        explanation={copy.explanation}
        facts={NO_FACTS}
        consequence={consequence}
        confirmLabel={copy.confirmLabel}
        cancelLabel={CONFIRM_CANCEL}
        closeLabel={CONFIRM_CLOSE}
      />
    </Stack>
  );
};
