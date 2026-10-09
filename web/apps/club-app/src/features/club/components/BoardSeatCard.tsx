import { KkHeading, KkMeta, KkPhoto } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { PORTRAIT_ASPECT, toPictureSources } from '@/lib/pictures';
import type { ClubBoardSeat } from '../schemas';

const PORTRAIT_SIZES = '(min-width: 900px) 12rem, 45vw';

interface BoardSeatCardProps {
  seat: ClubBoardSeat;
}

export const BoardSeatCard: FC<BoardSeatCardProps> = ({ seat }) => {
  const name = `${seat.person.firstName} ${seat.person.lastName}`;
  const initials = toInitials(seat.person.firstName, seat.person.lastName);
  const portrait = toPictureSources(seat.person.portrait, PORTRAIT_ASPECT);

  return (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      <KkPhoto
        alt={name}
        orientation="portrait"
        placeholderLabel={initials}
        source={portrait.source}
        sourceSet={portrait.sourceSet}
        sizes={PORTRAIT_SIZES}
      />
      <Stack sx={{ gap: 0.25, minWidth: 0 }}>
        <KkMeta tone="accent">{seat.officeName}</KkMeta>
        <KkHeading level={4} component="h3" sx={{ minWidth: 0 }}>
          {name}
        </KkHeading>
      </Stack>
    </Stack>
  );
};
