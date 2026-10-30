import type { KkFocusOverviewEdgeSide, KkFocusOverviewKey } from '@furria/ui/KkFocusOverview';
import { useRef, useState } from 'react';
import type { StudioScreen } from '@/features/act-studio/hooks/use-studio-screen';
import type { FocusWindow } from '../focus-window';
import {
  centredOn,
  firstWindowOf,
  keptInViewOf,
  MIN_WINDOW_SECONDS,
  pannedOf,
  placedWindowOf,
  resizedOf,
  ZOOM_FACTOR,
  zoomedOf,
} from '../focus-window';

const KEY_PAN_SHARE = 0.25;

export interface FocusView {
  view: FocusWindow;
  length: number;
  playing: boolean;
  canZoomIn: boolean;
  canZoomOut: boolean;
  zoomIn: () => void;
  zoomOut: () => void;
  aim: (share: number) => void;
  grab: (share: number) => void;
  pan: (share: number) => void;
  edge: (side: KkFocusOverviewEdgeSide, share: number) => void;
  release: () => void;
  key: (key: KkFocusOverviewKey) => void;
  seekShare: (share: number) => void;
  reveal: () => void;
}

export const useFocusView = (screen: StudioScreen): FocusView => {
  const { player, length, state } = screen.playback;
  const [view, setView] = useState<FocusWindow>(() => firstWindowOf(length));
  const [knownLength, setKnownLength] = useState(length);
  const [wasPlaying, setWasPlaying] = useState(state.playing);
  const grabOffset = useRef(0);

  if (knownLength !== length) {
    setKnownLength(length);
    setView(
      knownLength <= 0 ? firstWindowOf(length) : placedWindowOf(view.start, view.width, length),
    );
  }
  if (wasPlaying !== state.playing) {
    setWasPlaying(state.playing);
    if (!state.playing) {
      setView(centredOn(view, player.position(), length));
    }
  }

  const anchor = (): number => {
    const position = player.position();
    const shown = position >= view.start && position <= view.start + view.width;

    return state.playing || shown ? position : view.start + view.width / 2;
  };
  const zoom = (factor: number): void => {
    setView(zoomedOf(view, factor, anchor(), length));
  };

  return {
    view,
    length,
    playing: state.playing,
    canZoomIn: view.width > MIN_WINDOW_SECONDS + 0.01,
    canZoomOut: view.width < length - 0.01,
    zoomIn: () => {
      zoom(1 / ZOOM_FACTOR);
    },
    zoomOut: () => {
      zoom(ZOOM_FACTOR);
    },
    aim: (share) => {
      const seconds = share * length;
      if (state.playing) {
        player.seek(seconds);
        return;
      }
      setView(centredOn(view, seconds, length));
    },
    grab: (share) => {
      grabOffset.current = share * length - view.start;
    },
    pan: (share) => {
      if (state.playing) {
        return;
      }
      setView(placedWindowOf(share * length - grabOffset.current, view.width, length));
    },
    edge: (side, share) => {
      setView(resizedOf(view, side, share * length, length));
    },
    release: () => {
      grabOffset.current = 0;
    },
    key: (key) => {
      if (key === 'closer' || key === 'wider') {
        zoom(key === 'closer' ? 1 / ZOOM_FACTOR : ZOOM_FACTOR);
        return;
      }
      const delta = view.width * KEY_PAN_SHARE * (key === 'earlier' ? -1 : 1);
      setView(pannedOf(view, delta, length));
    },
    seekShare: (share) => {
      player.seek(Math.min(length, Math.max(0, share * length)));
    },
    reveal: () => {
      if (!state.playing) {
        setView(keptInViewOf(view, player.position(), length));
      }
    },
  };
};
