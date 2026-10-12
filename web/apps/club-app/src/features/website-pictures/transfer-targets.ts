import type { SlotCatalogue, WebsitePage } from '@furria/website-pictures';
import { transferTargetsOf } from '@furria/website-pictures';
import type { WebsitePicture } from './schemas';
import type { BoardPosition } from './website-board';
import { positionNameOf } from './website-copy';

export interface TransferTarget {
  slot: string;
  position: number;
  name: string;
  page: string;
}

export const namedTransferTargetsOf = <K extends string, P extends string>(
  pages: readonly WebsitePage<P>[],
  slots: SlotCatalogue<K, P>,
  orphan: BoardPosition,
  stored: readonly WebsitePicture[],
): TransferTarget[] =>
  orphan.picture === null
    ? []
    : transferTargetsOf(slots, orphan.picture, stored).map(({ slot, position }) => {
        const declared = slots[slot];
        return {
          slot,
          position,
          name: positionNameOf(declared.title, position, declared.positions.length),
          page: pages.find((page) => page.key === declared.page)?.title ?? '',
        };
      });
