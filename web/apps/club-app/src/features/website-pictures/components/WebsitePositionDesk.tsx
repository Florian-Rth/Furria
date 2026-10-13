import { KkFilmEdge, KkNote, KkText } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { deskActionsOf } from '../desk-actions';
import type { DeskNote } from '../desk-notes';
import { deskNotesOf } from '../desk-notes';
import type { PositionDesk } from '../hooks/use-position-desk';
import type { BoardPosition } from '../website-board';
import {
  ALT_DECORATIVE,
  aspectWordOf,
  FAILED_NOTE,
  PROCESSING_NOTE,
  positionNameOf,
  RECUT_NOTE,
  REPLACE_NOTE,
  STALLED_NOTE,
  UNREADABLE_NOTE,
  updatedLineOf,
} from '../website-copy';
import { editorNameOf } from '../website-people';
import { WebsiteAltField } from './WebsiteAltField';
import { WebsiteDeskActions } from './WebsiteDeskActions';
import { WebsiteDeskPreview } from './WebsiteDeskPreview';

const NOTES: Record<DeskNote, { text: string; tone: 'muted' | 'hint' | 'warning' }> = {
  recut: { text: RECUT_NOTE, tone: 'warning' },
  failed: { text: FAILED_NOTE, tone: 'warning' },
  processing: { text: PROCESSING_NOTE, tone: 'hint' },
  stalled: { text: STALLED_NOTE, tone: 'warning' },
  uncut: { text: UNREADABLE_NOTE, tone: 'hint' },
  replace: { text: REPLACE_NOTE, tone: 'muted' },
  decorative: { text: ALT_DECORATIVE, tone: 'muted' },
};

interface WebsitePositionDeskProps {
  position: BoardPosition;
  desk: PositionDesk;
  hasCopySources: boolean;
  hasTransferTargets: boolean;
  showsHeading: boolean;
}

export const WebsitePositionDesk: FC<WebsitePositionDeskProps> = ({
  position,
  desk,
  hasCopySources,
  hasTransferTargets,
  showsHeading,
}) => {
  const name = positionNameOf(position.slotTitle, position.position, position.count);
  const format = aspectWordOf(position.aspect);
  const heading = showsHeading ? (
    <KkFilmEdge lead={name} meta={format} size="line" level="h2" />
  ) : null;
  const actions = deskActionsOf(desk.phase, position, { hasCopySources, hasTransferTargets });
  const notes = deskNotesOf(desk.phase, position, desk.isUncutUpload).map((note) => (
    <KkNote key={note} tone={NOTES[note].tone}>
      {NOTES[note].text}
    </KkNote>
  ));
  const rejection =
    desk.rejection === null ? null : <KkNote tone="warning">{desk.rejection}</KkNote>;
  const picture = position.picture;
  const asksAlt = desk.phase === 'view' && !position.orphan && !position.decorative;
  const altField =
    asksAlt && picture !== null ? (
      <WebsiteAltField key={picture.mediaItemId} position={position} copied={desk.altCopied} />
    ) : null;
  const updatedLine =
    picture === null ? null : updatedLineOf(editorNameOf(picture.updatedBy), picture.updatedAt);
  const updated =
    updatedLine === null ? null : (
      <KkText variant="caption" tone="secondary">
        {updatedLine}
      </KkText>
    );

  return (
    <Stack sx={{ gap: 1.5, minWidth: 0 }}>
      {heading}
      <WebsiteDeskPreview position={position} desk={desk} />
      {rejection}
      {notes}
      <WebsiteDeskActions actions={actions} desk={desk} />
      {altField}
      {updated}
    </Stack>
  );
};
