import type { KkSx } from '@furria/ui';
import { KkAvatarStack, KkHeading, KkMeta, KkPanel, useKkSheetCommands } from '@furria/ui';
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

  const faces =
    summary.emptyLine === null ? (
      <KkAvatarStack
        initials={summary.initials}
        max={FACES_MAX}
        total={summary.holderCount}
        ringOn="paper"
      />
    ) : (
      <KkMeta italic>{summary.emptyLine}</KkMeta>
    );

  return (
    <KkPanel
      variant="block"
      chevron={false}
      dimmed={summary.holderCount === 0}
      onClick={openHolders}
      sx={sx}
    >
      <Stack sx={{ gap: 1.25, minWidth: 0, height: '100%' }}>
        <KkHeading level={5} component="h3" sx={{ minWidth: 0 }}>
          {venue.name}
        </KkHeading>
        <Stack sx={{ minWidth: 0, alignItems: 'flex-start', mt: 'auto', pt: 0.5 }}>{faces}</Stack>
      </Stack>
    </KkPanel>
  );
};
