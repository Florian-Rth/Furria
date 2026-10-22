import type { KkAspect } from '@furria/ui/image-aspect';
import type { PictureSlot, SlotCatalogue, WebsitePage } from '@furria/website-pictures';
import { fillOf, orphansOf, slotsByPage } from '@furria/website-pictures';
import type { WebsitePicture } from './schemas';

export type PositionStatus = 'empty' | 'processing' | 'stalled' | 'failed' | 'ready' | 'mismatch';

export type SlotFlag = 'failed' | 'stalled' | 'mismatch' | 'altMissing' | 'processing' | 'empty';

export interface BoardPosition {
  slot: string;
  slotTitle: string;
  position: number;
  count: number;
  aspect: KkAspect;
  decorative: boolean;
  status: PositionStatus;
  picture: WebsitePicture | null;
  needsAlt: boolean;
  orphan: boolean;
}

export interface BoardSlot {
  key: string;
  title: string;
  description: string;
  decorative: boolean;
  positions: BoardPosition[];
  filled: number;
  flag: SlotFlag | null;
}

export interface BoardPage {
  key: string;
  title: string;
  path: string | null;
  slots: BoardSlot[];
  filled: number;
  total: number;
}

export interface BoardSummary {
  filled: number;
  total: number;
  altMissing: number;
  mismatched: number;
}

export interface WebsiteBoard {
  pages: BoardPage[];
  orphans: BoardPosition[];
  summary: BoardSummary;
}

const FLAG_ORDER: readonly SlotFlag[] = [
  'failed',
  'stalled',
  'mismatch',
  'altMissing',
  'processing',
];

const statusOf = (
  state: 'empty' | 'filled' | 'aspectMismatch',
  picture: WebsitePicture | null,
): PositionStatus => {
  if (picture === null || state === 'empty') {
    return 'empty';
  }
  if (picture.picture.state === 'processing') {
    return picture.picture.isStalled ? 'stalled' : 'processing';
  }
  if (picture.picture.state === 'failed') {
    return 'failed';
  }
  return state === 'aspectMismatch' ? 'mismatch' : 'ready';
};

const positionsOf = (
  key: string,
  slot: PictureSlot,
  stored: readonly WebsitePicture[],
): BoardPosition[] =>
  fillOf(key, slot, stored).map((fill) => {
    const picture = fill.state === 'empty' ? null : fill.picture;
    return {
      slot: key,
      slotTitle: slot.title,
      position: fill.position,
      count: slot.positions.length,
      aspect: fill.aspect,
      decorative: slot.decorative,
      status: statusOf(fill.state, picture),
      picture,
      needsAlt: !slot.decorative && picture !== null && picture.alt === null,
      orphan: false,
    };
  });

const flagOf = (positions: readonly BoardPosition[]): SlotFlag | null => {
  const raised = FLAG_ORDER.find((flag) =>
    positions.some((position) =>
      flag === 'altMissing' ? position.needsAlt : position.status === flag,
    ),
  );
  if (raised !== undefined) {
    return raised;
  }
  return positions.every((position) => position.status === 'empty') ? 'empty' : null;
};

const orphanPositionOf = (picture: WebsitePicture): BoardPosition => ({
  slot: picture.slot,
  slotTitle: picture.slot,
  position: picture.position,
  count: 1,
  aspect: picture.aspect,
  decorative: true,
  status: statusOf('filled', picture),
  picture,
  needsAlt: false,
  orphan: true,
});

const isFilled = (position: BoardPosition): boolean => position.status !== 'empty';

export const websiteBoardOf = <K extends string, P extends string>(
  pages: readonly WebsitePage<P>[],
  slots: SlotCatalogue<K, P>,
  stored: readonly WebsitePicture[],
): WebsiteBoard => {
  const boardPages = slotsByPage(pages, slots).map(({ page, slots: pageSlots }) => {
    const boardSlots = pageSlots.map((slot) => {
      const positions = positionsOf(slot.key, slot, stored);
      return {
        key: slot.key,
        title: slot.title,
        description: slot.description,
        decorative: slot.decorative,
        positions,
        filled: positions.filter(isFilled).length,
        flag: flagOf(positions),
      };
    });
    return {
      key: page.key,
      title: page.title,
      path: page.path,
      slots: boardSlots,
      filled: boardSlots.reduce((sum, slot) => sum + slot.filled, 0),
      total: boardSlots.reduce((sum, slot) => sum + slot.positions.length, 0),
    };
  });
  const positions = boardPages.flatMap((page) => page.slots.flatMap((slot) => slot.positions));

  return {
    pages: boardPages,
    orphans: orphansOf(slots, stored).map(orphanPositionOf),
    summary: {
      filled: positions.filter(isFilled).length,
      total: positions.length,
      altMissing: positions.filter((position) => position.needsAlt).length,
      mismatched: positions.filter((position) => position.status === 'mismatch').length,
    },
  };
};

export const allPositionsOf = (board: WebsiteBoard): BoardPosition[] => [
  ...board.pages.flatMap((page) => page.slots.flatMap((slot) => slot.positions)),
  ...board.orphans,
];

export const copySourcesOf = (
  board: WebsiteBoard,
  target: Pick<BoardPosition, 'slot' | 'position'>,
): BoardPosition[] =>
  allPositionsOf(board).filter(
    (position) =>
      !position.orphan &&
      (position.status === 'ready' || position.status === 'mismatch') &&
      position.picture?.picture.uncroppedUrl != null &&
      !(position.slot === target.slot && position.position === target.position),
  );

export const findPosition = (
  board: WebsiteBoard,
  slot: string,
  position: number,
): BoardPosition | null =>
  allPositionsOf(board).find(
    (candidate) => candidate.slot === slot && candidate.position === position,
  ) ?? null;

export const developingOf = (board: WebsiteBoard): 'none' | 'developing' | 'stalled' => {
  const statuses = allPositionsOf(board).map((position) => position.status);
  if (statuses.includes('processing')) {
    return 'developing';
  }
  return statuses.includes('stalled') ? 'stalled' : 'none';
};
