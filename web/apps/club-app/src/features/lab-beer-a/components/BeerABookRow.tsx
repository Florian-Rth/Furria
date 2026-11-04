import { KkAlert } from '@furria/ui/KkAlert';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkTabCount } from '@furria/ui/KkTabCount';
import { KkTabHold } from '@furria/ui/KkTabHold';
import { KkTabUndo } from '@furria/ui/KkTabUndo';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { euroOf, UNDO_WINDOW_MS } from '@/features/lab-beer/beer-lab-ledger';
import {
  BEER_TITLE,
  bookConfirm,
  bookedDetail,
  bookedTitle,
  bookLabel,
  bookNote,
  COUNT_LABEL,
  countOptionLabel,
  HOLD_HINT,
  REFUSALS,
  UNDO_LABEL,
} from '../beer-a-copy';
import { nameOf } from '../beer-a-format';
import type { BeerAMember } from '../hooks/use-beer-member-a';

interface BeerABookRowProps {
  member: BeerAMember;
}

export const BeerABookRow: FC<BeerABookRowProps> = ({ member }) => {
  const refusal =
    member.refusal === null ? null : (
      <KkAlert severity="warning">{REFUSALS[member.refusal]}</KkAlert>
    );
  const options = member.countChoices.map((choice) => ({
    value: choice.value,
    label: countOptionLabel(choice.value),
    disabled: choice.disabled,
  }));
  const confirm = { ...bookConfirm(member.count, nameOf(member.owner)), eyebrow: BEER_TITLE };

  if (member.phase === 'undo' && member.undo.entry !== null) {
    const amount = euroOf(member.lastCount * member.pot.priceCents);

    return (
      <Stack sx={{ gap: 1, minWidth: 0 }}>
        <KkTabUndo
          title={bookedTitle(member.lastCount)}
          detail={bookedDetail(amount)}
          undoLabel={UNDO_LABEL}
          remainingMs={member.undo.remainingMs}
          windowMs={UNDO_WINDOW_MS}
          onUndo={member.undoBooking}
        />
        {refusal}
      </Stack>
    );
  }

  return (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      <Stack direction="row" sx={{ gap: 1, alignItems: 'flex-end', minWidth: 0 }}>
        <KkTabCount
          label={COUNT_LABEL}
          options={options}
          value={member.count}
          onChange={member.chooseCount}
          sx={{ flex: '0 0 40%' }}
        />
        <KkTabHold
          label={bookLabel(member.count)}
          hint={HOLD_HINT}
          confirm={confirm}
          onCommit={member.book}
          sx={{ flex: 1 }}
        />
      </Stack>
      <KkMeta>{bookNote(euroOf(member.pot.priceCents))}</KkMeta>
      {refusal}
    </Stack>
  );
};
