import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import { KkButton } from '@furria/ui/KkButton';
import { KkPourCopyLine } from '@furria/ui/KkPourCopyLine';
import { KkPourDay } from '@furria/ui/KkPourDay';
import { KkStepPane } from '@furria/ui/KkStepPane';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { euroOf } from '@/features/lab-beer/beer-lab-ledger';
import type { LabBeerPot } from '@/features/lab-beer/beer-lab-types';
import { CLOSE_LABEL } from '../pour-copy';
import type { PourMember } from '../pour-member';
import {
  PAY_COPIED_LABEL,
  PAY_COPY_LABEL,
  PAY_OPEN_TITLE,
  PAY_TITLE,
  payLeadOf,
  payLinkLabelOf,
  paypalLinkOf,
  payTotalOf,
} from '../pour-member-copy';
import { PourOpenCrateLine } from './PourOpenCrateLine';

interface PourPayDrawerProps {
  open: boolean;
  member: PourMember;
  pot: LabBeerPot;
  owner: string;
  now: string;
  onClose: () => void;
}

export const PourPayDrawer: FC<PourPayDrawerProps> = ({
  open,
  member,
  pot,
  owner,
  now,
  onClose,
}) => {
  const openCents = member.tab.openCents;
  const context = `an ${owner}`;
  const stateLabel = `${euroOf(openCents)} offen`;
  const lead = payLeadOf(owner);
  const total = payTotalOf(member.tab.openCount, openCents);
  const paypalHref = pot.paymentLink === null ? null : paypalLinkOf(pot.paymentLink, openCents);
  const paypalLabel = payLinkLabelOf(openCents);
  const paypal =
    paypalHref === null ? null : (
      <KkButton variant="contained" size="large" fullWidth href={paypalHref}>
        {paypalLabel}
      </KkButton>
    );
  const note =
    pot.paymentNote === null ? null : (
      <KkPourCopyLine
        text={pot.paymentNote}
        copyLabel={PAY_COPY_LABEL}
        copiedLabel={PAY_COPIED_LABEL}
      />
    );
  const lines = member.openCrates.map((entry) => (
    <PourOpenCrateLine key={entry.crate.id} entry={entry} now={now} />
  ));

  return (
    <KkBottomDrawer open={open} label={PAY_TITLE} closeLabel={CLOSE_LABEL} onClose={onClose}>
      <KkStepPane label={PAY_TITLE} framed={false}>
        <KkStepPane.Head
          icon="fees"
          title={PAY_TITLE}
          context={context}
          state="current"
          stateLabel={stateLabel}
        />
        <KkStepPane.Body>
          <Stack sx={{ gap: 1.5 }}>
            <KkText variant="body2" tone="secondary">
              {lead}
            </KkText>
            {paypal}
            {note}
            <Stack>
              <KkPourDay label={PAY_OPEN_TITLE} facts={total} />
              {lines}
            </Stack>
          </Stack>
        </KkStepPane.Body>
      </KkStepPane>
    </KkBottomDrawer>
  );
};
