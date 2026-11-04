import { KkAlert } from '@furria/ui/KkAlert';
import { KkButton } from '@furria/ui/KkButton';
import { KkHeading } from '@furria/ui/KkHeading';
import { KkTabCount } from '@furria/ui/KkTabCount';
import { KkTabHold } from '@furria/ui/KkTabHold';
import { KkTabUndo } from '@furria/ui/KkTabUndo';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { euroOf, UNDO_WINDOW_MS } from '@/features/lab-beer/beer-lab-ledger';
import {
  BOOK_AGAIN,
  bookConfirm,
  bookedDetail,
  bookedTitle,
  bookLabel,
  COUNT_LABEL,
  countCaption,
  countOptionLabel,
  DONE_TITLE,
  doneDetail,
  EMPTY_TITLE,
  emptyText,
  HOLD_HINT,
  REFUSALS,
  UNDO_LABEL,
} from '../beer-a-copy';
import { nameOf } from '../beer-a-format';
import type { BeerAMember } from '../hooks/use-beer-member-a';

interface BeerBookAFootProps {
  member: BeerAMember;
}

export const BeerBookAFoot: FC<BeerBookAFootProps> = ({ member }) => {
  const owner = nameOf(member.owner);
  const refusal =
    member.refusal === null ? null : (
      <KkAlert severity="warning">{REFUSALS[member.refusal]}</KkAlert>
    );

  if (member.phase === 'undo' && member.undo.entry !== null) {
    return (
      <KkTabUndo
        variant="stage"
        title={bookedTitle(member.lastCount)}
        detail={bookedDetail(euroOf(member.lastCount * member.pot.priceCents))}
        undoLabel={UNDO_LABEL}
        remainingMs={member.undo.remainingMs}
        windowMs={UNDO_WINDOW_MS}
        onUndo={member.undoBooking}
      />
    );
  }

  if (member.phase === 'done') {
    return (
      <Stack sx={{ gap: 1.5, alignItems: 'center', textAlign: 'center', minWidth: 0 }}>
        <KkHeading level={1} component="p">
          {DONE_TITLE}
        </KkHeading>
        <KkText tone="secondary">
          {doneDetail(member.lastCount, euroOf(member.tab.openCents))}
        </KkText>
        <KkButton variant="outlined" size="large" fullWidth onClick={member.bookAgain}>
          {BOOK_AGAIN}
        </KkButton>
      </Stack>
    );
  }

  if (member.bookingState === 'empty') {
    return (
      <KkAlert severity="warning">
        <strong>{EMPTY_TITLE}</strong> {emptyText(owner)}
      </KkAlert>
    );
  }

  const options = member.countChoices.map((choice) => ({
    value: choice.value,
    label: countOptionLabel(choice.value),
    caption: countCaption(choice.value),
    disabled: choice.disabled,
  }));

  return (
    <Stack sx={{ gap: 1.5, minWidth: 0 }}>
      {refusal}
      <KkTabCount
        label={COUNT_LABEL}
        options={options}
        value={member.count}
        onChange={member.chooseCount}
        size="large"
      />
      <KkTabHold
        label={bookLabel(member.count)}
        hint={HOLD_HINT}
        confirm={bookConfirm(member.count, owner)}
        size="large"
        onCommit={member.book}
      />
    </Stack>
  );
};
