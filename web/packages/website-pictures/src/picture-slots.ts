import type { KkAspect } from '@furria/ui/image-aspect';
import { aspectOf } from '@furria/ui/image-aspect';
import type { PictureSlot, WebsitePage } from './slot-catalogue';

export type SlotCatalogue<K extends string, P extends string> = Readonly<Record<K, PictureSlot<P>>>;

export interface StoredWebsitePicture {
  slot: string;
  position: number;
  aspect: number;
}

export interface DeclaredSlot<K extends string, P extends string> extends PictureSlot<P> {
  key: K;
}

export interface PageSlots<K extends string, P extends string> {
  page: WebsitePage<P>;
  slots: DeclaredSlot<K, P>[];
}

export type PositionFill<S extends StoredWebsitePicture> =
  | { position: number; aspect: KkAspect; state: 'empty' }
  | { position: number; aspect: KkAspect; state: 'filled' | 'aspectMismatch'; picture: S };

export interface FillCount {
  filled: number;
  total: number;
}

export interface SlotPosition<K extends string> {
  slot: K;
  position: number;
}

const FIRST_POSITION = 1;
const ASPECT_TOLERANCE = 1e-3;

const declaredSlotsOf = <K extends string, P extends string>(
  slots: SlotCatalogue<K, P>,
): DeclaredSlot<K, P>[] =>
  Object.keys(slots)
    .filter((key): key is K => key in slots)
    .map((key) => ({ ...slots[key], key }));

const matchesAspect = (declared: KkAspect, stored: number): boolean =>
  Math.abs(aspectOf(declared) - stored) < ASPECT_TOLERANCE;

const storedAt = <S extends StoredWebsitePicture>(
  stored: readonly S[],
  slot: string,
  position: number,
): S | undefined =>
  stored.find((picture) => picture.slot === slot && picture.position === position);

export const slotsByPage = <K extends string, P extends string>(
  pages: readonly WebsitePage<P>[],
  slots: SlotCatalogue<K, P>,
): PageSlots<K, P>[] => {
  const declared = declaredSlotsOf(slots);

  return pages
    .map((page) => ({ page, slots: declared.filter((slot) => slot.page === page.key) }))
    .filter((group) => group.slots.length > 0);
};

export const fillOf = <S extends StoredWebsitePicture>(
  key: string,
  slot: PictureSlot,
  stored: readonly S[],
): PositionFill<S>[] =>
  slot.positions.map((aspect, index) => {
    const position = index + FIRST_POSITION;
    const picture = storedAt(stored, key, position);

    if (picture === undefined) {
      return { position, aspect, state: 'empty' };
    }

    const state = matchesAspect(aspect, picture.aspect) ? 'filled' : 'aspectMismatch';
    return { position, aspect, state, picture };
  });

export const fillCountOf = <K extends string, P extends string>(
  slots: SlotCatalogue<K, P>,
  stored: readonly StoredWebsitePicture[],
): FillCount =>
  declaredSlotsOf(slots)
    .flatMap((slot) => fillOf(slot.key, slot, stored))
    .reduce(
      (count, fill) => ({
        filled: count.filled + (fill.state === 'empty' ? 0 : 1),
        total: count.total + 1,
      }),
      { filled: 0, total: 0 },
    );

const isDeclared = <K extends string, P extends string>(
  slots: SlotCatalogue<K, P>,
  picture: StoredWebsitePicture,
): boolean =>
  declaredSlotsOf(slots).some(
    (slot) =>
      slot.key === picture.slot &&
      picture.position >= FIRST_POSITION &&
      picture.position < slot.positions.length + FIRST_POSITION,
  );

export const orphansOf = <S extends StoredWebsitePicture, K extends string, P extends string>(
  slots: SlotCatalogue<K, P>,
  stored: readonly S[],
): S[] => stored.filter((picture) => !isDeclared(slots, picture));

export const transferTargetsOf = <K extends string, P extends string>(
  slots: SlotCatalogue<K, P>,
  orphan: StoredWebsitePicture,
  stored: readonly StoredWebsitePicture[],
): SlotPosition<K>[] =>
  declaredSlotsOf(slots).flatMap((slot) =>
    fillOf(slot.key, slot, stored)
      .filter((fill) => fill.state === 'empty' && matchesAspect(fill.aspect, orphan.aspect))
      .map((fill) => ({ slot: slot.key, position: fill.position })),
  );
