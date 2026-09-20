import { useState } from 'react';

export type VenueDialogKind = 'edit' | 'archive' | 'restore';

interface VenueDialogTarget {
  kind: VenueDialogKind;
  venueId: number;
}

export interface VenueDialogs {
  kind: VenueDialogKind | null;
  venueId: number | null;
  openEdit: (venueId: number) => void;
  openArchive: (venueId: number) => void;
  openRestore: (venueId: number) => void;
  close: () => void;
}

export const useVenueDialogs = (): VenueDialogs => {
  const [target, setTarget] = useState<VenueDialogTarget | null>(null);

  const openWith =
    (kind: VenueDialogKind) =>
    (venueId: number): void => {
      setTarget({ kind, venueId });
    };

  return {
    kind: target?.kind ?? null,
    venueId: target?.venueId ?? null,
    openEdit: openWith('edit'),
    openArchive: openWith('archive'),
    openRestore: openWith('restore'),
    close: () => {
      setTarget(null);
    },
  };
};
