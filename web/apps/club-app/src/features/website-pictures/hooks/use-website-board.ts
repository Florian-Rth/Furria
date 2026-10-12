import { useIsWideScreen, useKkSheet } from '@furria/ui';
import { WEBSITE_PAGES, WEBSITE_PICTURE_SLOTS } from '@furria/website-pictures';
import type { UseQueryResult } from '@tanstack/react-query';
import { useState } from 'react';
import { useDevelopingPicture } from '@/lib/media/use-developing-picture';
import { useWebsitePicturesQuery } from '../api';
import type { WebsitePictures } from '../schemas';
import type { TransferTarget } from '../transfer-targets';
import { namedTransferTargetsOf } from '../transfer-targets';
import type { SlotPositionRef } from '../types';
import type { BoardPosition, WebsiteBoard } from '../website-board';
import { allPositionsOf, copySourcesOf, findPosition, websiteBoardOf } from '../website-board';
import { DESK_SHEET_ID } from '../website-copy';

export interface WebsiteBoardState {
  query: UseQueryResult<WebsitePictures, Error>;
  board: WebsiteBoard | null;
  selected: BoardPosition | null;
  copySources: BoardPosition[];
  transferTargets: TransferTarget[];
  isWide: boolean;
  select: (at: SlotPositionRef) => void;
  showDesk: () => void;
  announce: () => Promise<void>;
  reload: () => void;
}

const isProcessing = (board: WebsiteBoard | null): boolean =>
  board !== null && allPositionsOf(board).some((position) => position.status === 'processing');

export const useWebsiteBoard = (): WebsiteBoardState => {
  const query = useWebsitePicturesQuery(true);
  const sheet = useKkSheet();
  const isWide = useIsWideScreen();
  const [selection, setSelection] = useState<SlotPositionRef | null>(null);
  const board =
    query.data === undefined
      ? null
      : websiteBoardOf(WEBSITE_PAGES, WEBSITE_PICTURE_SLOTS, query.data.pictures);
  const reload = (): void => {
    void query.refetch();
  };
  const announce = useDevelopingPicture({
    isDeveloping: isProcessing(board),
    refresh: reload,
    changes: ['websitePicture'],
  });
  const selected =
    board === null || selection === null
      ? null
      : findPosition(board, selection.slot, selection.position);
  const showDesk = (): void => {
    if (!isWide) {
      sheet.open(DESK_SHEET_ID);
    }
  };

  const copySources = board === null || selected === null ? [] : copySourcesOf(board, selected);
  const transferTargets =
    query.data === undefined || selected === null || !selected.orphan
      ? []
      : namedTransferTargetsOf(WEBSITE_PAGES, WEBSITE_PICTURE_SLOTS, selected, query.data.pictures);

  return {
    query,
    board,
    selected,
    copySources,
    transferTargets,
    isWide,
    select: (at) => {
      setSelection(at);
      showDesk();
    },
    showDesk,
    announce,
    reload,
  };
};
