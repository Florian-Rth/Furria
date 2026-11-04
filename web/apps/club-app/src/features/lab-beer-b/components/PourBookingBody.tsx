import { KkConfettiBurst } from '@furria/ui/KkConfettiBurst';
import { KkHeading } from '@furria/ui/KkHeading';
import { KkPourCrate } from '@furria/ui/KkPourCrate';
import { KkPourCrateStack } from '@furria/ui/KkPourCrateStack';
import { KkPourDeclaration } from '@furria/ui/KkPourDeclaration';
import { KkText } from '@furria/ui/KkText';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { PourBooking } from '../hooks/use-pour-booking';
import {
  bookedTitleOf,
  DECLARATION_LEAD,
  DECLARATION_REST,
  DECLARE_TITLE,
  DONE_LINE,
  EMPTY_TEXT,
  EMPTY_TITLE,
  openNowOf,
  STACK_LABEL,
  summaryOf,
} from '../pour-booking-copy';
import { countsOf } from '../pour-member-copy';

interface PourBookingBodyProps {
  booking: PourBooking;
  owner: string;
}

export const PourBookingBody: FC<PourBookingBodyProps> = ({ booking, owner }) => {
  if (booking.stage === 'empty' && booking.phase === 'pick') {
    return (
      <Stack sx={{ gap: 1.5, alignItems: 'center', textAlign: 'center' }}>
        <KkPourCrate filled={false} size="hero" tone="faint" />
        <KkHeading level={2}>{EMPTY_TITLE}</KkHeading>
        <KkText variant="body2" tone="secondary">
          {EMPTY_TEXT}
        </KkText>
      </Stack>
    );
  }

  const gone = booking.phase !== 'pick';
  const counts = countsOf(booking.member.maxCount);
  const value = gone ? booking.bookedCount : booking.count;
  const declaration =
    booking.stage === 'declare' && !gone ? (
      <KkPourDeclaration
        title={DECLARE_TITLE}
        lead={DECLARATION_LEAD}
        owner={owner}
        rest={DECLARATION_REST}
      />
    ) : null;
  const summary = summaryOf(booking.world.pot.priceCents, booking.openAfterCents);
  const bookedTitle = bookedTitleOf(booking.bookedCount);
  const openNow = openNowOf(booking.member.tab.openCents);
  const result = gone ? (
    <Stack sx={{ gap: 0.5, alignItems: 'center', textAlign: 'center' }}>
      <KkHeading level={1}>{bookedTitle}</KkHeading>
      <KkText variant="body2">{openNow}</KkText>
      <KkText variant="body2" tone="secondary">
        {DONE_LINE}
      </KkText>
    </Stack>
  ) : (
    <KkText variant="body2" tone="secondary" sx={{ textAlign: 'center' }}>
      {summary}
    </KkText>
  );

  return (
    <Stack sx={{ gap: 2, minWidth: 0 }}>
      {declaration}
      <Box sx={{ position: 'relative' }}>
        <KkPourCrateStack
          label={STACK_LABEL}
          counts={counts}
          value={value}
          gone={gone}
          onChange={booking.chooseCount}
        />
        <KkConfettiBurst fireKey={booking.confettiKey} count={36} alwaysPlays />
      </Box>
      {result}
    </Stack>
  );
};
