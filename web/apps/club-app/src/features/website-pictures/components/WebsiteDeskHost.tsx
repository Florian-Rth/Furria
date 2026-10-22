import { KkConfirmDialog } from '@furria/ui/KkConfirmDialog';
import { KkSheet } from '@furria/ui/KkSheet';
import { useKkSheet } from '@furria/ui/sheet-store';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { usePickableAlbumsQuery } from '@/features/gallery-pick/api';
import { GalleryPickSheet } from '@/features/gallery-pick/components/GalleryPickSheet';
import { PICTURE_ACCEPT } from '@/features/pictures/picture-target';
import { usePositionDesk } from '../hooks/use-position-desk';
import type { TransferTarget } from '../transfer-targets';
import type { SlotPositionRef } from '../types';
import type { BoardPosition } from '../website-board';
import {
  CLOSE_LABEL,
  DESK_SHEET_ID,
  GALLERY_EMPTY,
  GALLERY_NOTE,
  GALLERY_SHEET_ID,
  galleryTitleOf,
  positionNameOf,
  REMOVE_CONFIRM,
  REMOVE_EXPLANATION,
  REMOVE_EYEBROW,
  REMOVE_FACT,
  REMOVE_KEEP,
  REMOVE_QUESTION,
} from '../website-copy';
import { WebsiteCopySheet } from './WebsiteCopySheet';
import { WebsitePositionDesk } from './WebsitePositionDesk';
import { WebsiteTransferSheet } from './WebsiteTransferSheet';

interface WebsiteDeskHostProps {
  position: BoardPosition;
  copySources: readonly BoardPosition[];
  transferTargets: readonly TransferTarget[];
  isWide: boolean;
  announce: () => Promise<void>;
  onMoved: (target: SlotPositionRef) => void;
}

export const WebsiteDeskHost: FC<WebsiteDeskHostProps> = ({
  position,
  copySources,
  transferTargets,
  isWide,
  announce,
  onMoved,
}) => {
  const desk = usePositionDesk(position, announce, onMoved);
  const { openSheetId } = useKkSheet();
  const albums = usePickableAlbumsQuery(openSheetId === GALLERY_SHEET_ID);
  const name = positionNameOf(position.slotTitle, position.position, position.count);
  const galleryTitle = galleryTitleOf(name);
  const removeFacts = [{ label: REMOVE_FACT, value: name }];
  const reloadAlbums = (): void => {
    void albums.refetch();
  };
  const body = (
    <WebsitePositionDesk
      position={position}
      desk={desk}
      hasCopySources={copySources.length > 0}
      hasTransferTargets={transferTargets.length > 0}
      showsHeading={isWide}
    />
  );
  const placed = isWide ? (
    body
  ) : (
    <KkSheet id={DESK_SHEET_ID} title={name} closeLabel={CLOSE_LABEL}>
      <KkSheet.Body>{body}</KkSheet.Body>
    </KkSheet>
  );

  return (
    <>
      {placed}
      <Box
        component="input"
        type="file"
        accept={PICTURE_ACCEPT}
        ref={desk.fileInputRef}
        onChange={desk.onFileChosen}
        hidden
      />
      <GalleryPickSheet
        id={GALLERY_SHEET_ID}
        title={galleryTitle}
        note={GALLERY_NOTE}
        emptyNote={GALLERY_EMPTY}
        albums={albums.data}
        albumsError={albums.error}
        isReloading={albums.isFetching}
        onReload={reloadAlbums}
        onPick={desk.pickPhoto}
      />
      <WebsiteCopySheet sources={copySources} onPick={desk.copyFrom} />
      <WebsiteTransferSheet targets={transferTargets} onPick={desk.transferTo} />
      <KkConfirmDialog
        open={desk.removal.isOpen}
        onClose={desk.removal.close}
        onConfirm={desk.removal.submit}
        tone="danger"
        eyebrow={REMOVE_EYEBROW}
        question={REMOVE_QUESTION}
        explanation={REMOVE_EXPLANATION}
        facts={removeFacts}
        error={desk.removal.rejection ?? undefined}
        confirmLabel={REMOVE_CONFIRM}
        cancelLabel={REMOVE_KEEP}
        closeLabel={CLOSE_LABEL}
        busy={desk.removal.isSaving}
      />
    </>
  );
};
