import { KkAvatarStack } from '@furria/ui/KkAvatarStack';
import { KkHeading } from '@furria/ui/KkHeading';
import { KkPanel } from '@furria/ui/KkPanel';
import type { KkSx } from '@furria/ui/kk-sx';
import { useKkSheetCommands } from '@furria/ui/sheet-store';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toKeyVenueSummary } from '@/lib/key-holders';
import { toPeekId } from '@/lib/peek';
import type { ClubVenue } from '../schemas';

const FACES_MAX = 4;

interface KeyVenueTileProps {
  venue: ClubVenue;
  sx?: KkSx;
}

export const KeyVenueTile: FC<KeyVenueTileProps> = ({ venue, sx }) => {
  const sheet = useKkSheetCommands();
  const summary = toKeyVenueSummary(venue.holders);

  const openHolders = (): void => {
    sheet.open(toPeekId('venue', venue.venueId));
  };

  return (
    <KkPanel variant="block" chevron={false} onClick={openHolders} sx={sx}>
      <Stack sx={{ gap: 1.25, minWidth: 0, height: '100%' }}>
        <KkHeading level={4} component="h3" sx={{ minWidth: 0 }}>
          {venue.name}
        </KkHeading>
        <Stack sx={{ minWidth: 0, alignItems: 'flex-start', mt: 'auto', pt: 0.5 }}>
          <KkAvatarStack
            initials={summary.initials}
            portraits={summary.portraits}
            max={FACES_MAX}
            total={summary.holderCount}
            ringOn="paper"
          />
        </Stack>
      </Stack>
    </KkPanel>
  );
};
