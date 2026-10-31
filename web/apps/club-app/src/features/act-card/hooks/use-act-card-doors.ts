import { useKkSheet } from '@furria/ui/sheet-store';
import { useIsWideScreen } from '@furria/ui/use-is-wide-screen';
import { toSheetId } from '../act-card-copy';
import type { DoorKey } from '../act-card-model';
import { paneDoorOf, sideDoorOf } from '../act-card-model';

export interface ActCardDoors {
  wide: boolean;
  pane: DoorKey | null;
  side: DoorKey | null;
  open: (door: DoorKey) => void;
}

export const useActCardDoors = (doors: readonly DoorKey[]): ActCardDoors => {
  const sheet = useKkSheet();
  const wide = useIsWideScreen();
  const opened = doors.find((door) => toSheetId(door) === sheet.openSheetId) ?? null;
  const pane = paneDoorOf(opened, doors);

  const open = (door: DoorKey): void => {
    sheet.open(toSheetId(door));
  };

  return { wide, pane, side: sideDoorOf(pane, doors), open };
};
