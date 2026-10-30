import type { KkEightsGlyphName } from '@furria/ui/KkEightsGlyph';
import type { KkEightsSetupSegment } from '@furria/ui/KkEightsSetup';
import type { ActUploads } from '@/features/act-studio/hooks/use-act-uploads';
import { useActUploads } from '@/features/act-studio/hooks/use-act-uploads';
import { markSecondsOf } from '@/features/act-studio/studio-steps';
import {
  nextEyebrowOf,
  SETUP_ALL_DONE,
  SETUP_COPY,
  SETUP_GO,
  SETUP_STATE_TEXT,
  SETUP_WAITING_LEAD,
  setupMetaOf,
} from '../eights-copy';
import type { SetupItemKey, SetupState } from '../setup-progress';
import type { EightsMusicTab } from './use-eights-routes';
import type { EightsStudio } from './use-eights-studio';

export interface EightsSetupRow {
  key: SetupItemKey;
  number: number;
  text: string;
  meta: string;
  state: SetupState;
  stateText: string;
  action: string | null;
  run: () => void;
}

export interface EightsSetupNext {
  eyebrow: string;
  title: string;
  text: string;
  glyph: KkEightsGlyphName;
  action: string;
  run: () => void;
}

export interface EightsSetup {
  segments: KkEightsSetupSegment[];
  next: EightsSetupNext | null;
  rows: EightsSetupRow[];
  doneText: string;
  uploads: ActUploads;
}

const GLYPHS: Record<SetupItemKey, KkEightsGlyphName> = {
  music: 'music',
  steps: 'markStep',
  spots: 'spots',
  formation: 'formation',
  video: 'video',
  final: 'music',
};

const NAVIGATING: readonly SetupItemKey[] = ['music', 'video', 'final'];

export const useEightsSetup = (
  studio: EightsStudio,
  openMusic: (tab: EightsMusicTab) => void,
  close: () => void,
): EightsSetup => {
  const { screen, editor, progress } = studio;
  const { playback, manual, actId } = screen;
  const uploads = useActUploads(actId, screen.music.add.mutateAsync);
  const total = progress.items.length;

  const run = (key: SetupItemKey): void => {
    switch (key) {
      case 'music':
        if (progress.items[0]?.state === 'done') {
          openMusic('music');
          return;
        }
        uploads.choose();
        return;
      case 'steps':
        if (playback.length <= 0) {
          return;
        }
        playback.player.seek(0);
        manual.mark.mutate(markSecondsOf(playback, 0));
        close();
        return;
      case 'spots':
        editor.addSpot();
        return;
      case 'formation':
        editor.preset('line');
        close();
        return;
      case 'video':
        openMusic('video');
        return;
      default:
        openMusic('music');
    }
  };

  const nextIndex = progress.items.findIndex((item) => item.key === progress.next);
  const nextItem = progress.items[nextIndex];
  const nextCopy = nextItem === undefined ? null : SETUP_COPY[nextItem.key];

  return {
    uploads,
    doneText: SETUP_ALL_DONE,
    segments: progress.items.map((item) => ({
      key: item.key,
      text: SETUP_COPY[item.key].text,
      stateText: SETUP_STATE_TEXT[item.state],
      state: item.state,
      next: item.key === progress.next,
    })),
    next:
      nextItem === undefined || nextCopy === null
        ? null
        : {
            eyebrow: nextEyebrowOf(nextIndex + 1, total),
            title: nextCopy.title,
            text: nextItem.state === 'waiting' ? SETUP_WAITING_LEAD : nextCopy.lead,
            glyph: GLYPHS[nextItem.key],
            action: nextCopy.action,
            run: () => {
              run(nextItem.key);
            },
          },
    rows: progress.items.map((item, index) => {
      const open = item.state === 'open' || item.state === 'waiting';
      const reopen = item.state === 'done' && NAVIGATING.includes(item.key);
      return {
        key: item.key,
        number: index + 1,
        text: SETUP_COPY[item.key].text,
        meta: setupMetaOf(screen.studio, item),
        state: item.state,
        stateText: SETUP_STATE_TEXT[item.state],
        action: open ? SETUP_COPY[item.key].action : reopen ? SETUP_GO : null,
        run: () => {
          run(item.key);
        },
      };
    }),
  };
};
