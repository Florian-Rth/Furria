import type { KkBannerDeskActions } from '@furria/ui/banner-desk-types';
import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import type {
  PortraitBanner,
  PortraitCut,
  PortraitPick,
  PortraitPickEvent,
} from '../portrait-pick';
import {
  advancePortraitPick,
  liveSourcesOf,
  NO_PORTRAIT,
  portraitBannerOf,
  portraitOf,
} from '../portrait-pick';

export interface PortraitPickControl {
  portrait: PortraitCut | null;
  banner: PortraitBanner;
  isCutting: boolean;
  actions: KkBannerDeskActions;
  fileInputRef: (node: HTMLInputElement | null) => void;
  onFileChosen: (event: ChangeEvent<HTMLInputElement>) => void;
}

const useReleasedSources = (live: readonly string[]): void => {
  const [created] = useState(() => new Set<string>());
  const liveKey = live.join(' ');

  useEffect(() => {
    const kept = new Set(liveKey === '' ? [] : liveKey.split(' '));
    for (const source of kept) {
      created.add(source);
    }
    for (const source of created) {
      if (!kept.has(source)) {
        URL.revokeObjectURL(source);
        created.delete(source);
      }
    }
  }, [created, liveKey]);

  useEffect(
    () => () => {
      for (const source of created) {
        URL.revokeObjectURL(source);
      }
    },
    [created],
  );
};

export const usePortraitPick = (): PortraitPickControl => {
  const [pick, setPick] = useState<PortraitPick>(NO_PORTRAIT);
  const [input, setInput] = useState<HTMLInputElement | null>(null);
  useReleasedSources(liveSourcesOf(pick));

  const dispatch = (event: PortraitPickEvent): void => {
    setPick((current) => advancePortraitPick(current, event));
  };
  const chooseFile = (): void => {
    input?.click();
  };

  return {
    portrait: portraitOf(pick),
    banner: portraitBannerOf(pick),
    isCutting: pick.kind === 'cutting',
    actions: {
      onUpload: chooseFile,
      onRetry: chooseFile,
      onCrop: () => {
        dispatch({ kind: 'recut' });
      },
      onCropDone: () => {
        dispatch({ kind: 'cutDone' });
      },
      onCropCancel: () => {
        dispatch({ kind: 'cutCancelled' });
      },
      onRemove: () => {
        dispatch({ kind: 'removed' });
      },
      onCropChange: (crop) => {
        dispatch({ kind: 'cropChanged', crop });
      },
      onUnreadable: () => {
        dispatch({ kind: 'unreadable' });
      },
    },
    fileInputRef: setInput,
    onFileChosen: (event) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (file !== undefined) {
        dispatch({ kind: 'chosen', photo: { file, source: URL.createObjectURL(file) } });
      }
    },
  };
};
