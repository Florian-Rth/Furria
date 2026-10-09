import { KkButton, KkFilmEdge, KkSelectField, KkSheet, KkTextField } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { INBOX_SHEET_ID } from '../hooks/use-gallery-inbox';
import type { InboxBaskets } from '../hooks/use-inbox-baskets';
import { BASKET_COUNT } from '../hooks/use-inbox-baskets';
import type { InboxOwnerChoice } from '../hooks/use-inbox-owner';
import {
  BASKETS_TITLE,
  basketFieldOf,
  INBOX_FIELD,
  NEW_ALBUM_ACTION,
  NEW_ALBUM_FIELD,
  SHEET_CLOSE,
  SHEET_TITLE,
} from '../inbox-copy';

interface GalleryInboxSheetProps {
  baskets: InboxBaskets;
  inboxOwner: InboxOwnerChoice;
}

const SLOTS = Array.from({ length: BASKET_COUNT }, (_, slot) => slot);

export const GalleryInboxSheet: FC<GalleryInboxSheetProps> = ({ baskets, inboxOwner }) => {
  const ownerField =
    inboxOwner.options.length === 0 ? null : (
      <KkSelectField
        name="inbox"
        label={INBOX_FIELD}
        value={inboxOwner.value}
        options={inboxOwner.options}
        onChange={inboxOwner.onChange}
        presentation="select"
      />
    );
  const slotFields = SLOTS.map((slot) => {
    const choose = (value: string): void => baskets.setSlot(slot, value);
    return (
      <KkSelectField
        key={slot}
        name={`korb-${slot}`}
        label={basketFieldOf(slot)}
        value={baskets.valueOf(slot)}
        options={baskets.options}
        onChange={choose}
        presentation="select"
      />
    );
  });
  const cannotCreate = baskets.newTitle.trim() === '';

  return (
    <KkSheet id={INBOX_SHEET_ID} title={SHEET_TITLE} closeLabel={SHEET_CLOSE}>
      <KkSheet.Body>
        <Stack sx={{ rowGap: 2 }}>
          {ownerField}
          <KkFilmEdge lead={BASKETS_TITLE} tone="gold" level="h3" sprockets />
          {slotFields}
          <Stack direction="row" sx={{ columnGap: 1, alignItems: 'flex-end' }}>
            <KkTextField
              name="new-album"
              label={NEW_ALBUM_FIELD}
              value={baskets.newTitle}
              onChange={baskets.onNewTitle}
            />
            <KkButton
              variant="outlined"
              onClick={baskets.createAlbum}
              loading={baskets.creating}
              disabled={cannotCreate}
            >
              {NEW_ALBUM_ACTION}
            </KkButton>
          </Stack>
        </Stack>
      </KkSheet.Body>
    </KkSheet>
  );
};
