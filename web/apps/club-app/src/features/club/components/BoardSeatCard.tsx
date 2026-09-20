import { KkHeading, KkMeta, KkPhoto } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import type { ClubBoardSeat } from '../schemas';

interface BoardSeatCardProps {
  seat: ClubBoardSeat;
}

export const BoardSeatCard: FC<BoardSeatCardProps> = ({ seat }) => {
  const name = `${seat.person.firstName} ${seat.person.lastName}`;
  const initials = toInitials(seat.person.firstName, seat.person.lastName);
  const portrait = seat.person.portraitUrl ?? undefined;

  return (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      <KkPhoto alt={name} orientation="portrait" placeholderLabel={initials} source={portrait} />
      <Stack sx={{ gap: 0.25, minWidth: 0 }}>
        <KkMeta tone="accent">{seat.officeName}</KkMeta>
        <KkHeading level={6} component="h3" sx={{ minWidth: 0 }}>
          {name}
        </KkHeading>
      </Stack>
    </Stack>
  );
};
