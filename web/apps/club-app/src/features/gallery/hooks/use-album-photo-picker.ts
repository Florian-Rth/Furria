import { useKkSheetCommands } from '@furria/ui';
import { useState } from 'react';
import { toggleId } from '../selection-draft';

export interface AlbumPhotoPicker {
  sheetId: string;
  picked: ReadonlySet<number>;
  open: () => void;
  toggle: (mediaItemId: number) => void;
  confirm: () => void;
}

export const useAlbumPhotoPicker = (
  sheetId: string,
  onPick: (mediaItemIds: readonly number[]) => void,
): AlbumPhotoPicker => {
  const sheet = useKkSheetCommands();
  const [picked, setPicked] = useState<ReadonlySet<number>>(() => new Set());

  return {
    sheetId,
    picked,
    open: () => {
      setPicked(new Set());
      sheet.open(sheetId);
    },
    toggle: (mediaItemId) => setPicked((current) => toggleId(current, mediaItemId)),
    confirm: () => {
      onPick([...picked]);
      sheet.close();
    },
  };
};
