import type { KkSize } from '../image-aspect';
import type { KkImageSource } from '../image-source';

export interface KkViewerVideo {
  src: string;
  duration: string;
}

export interface KkViewerItem {
  key: string;
  alt: string;
  image: KkImageSource | null;
  size?: KkSize;
  caption?: string;
  video?: KkViewerVideo;
}

export interface KkViewerLabels {
  dialog: string;
  close: string;
  previous: string;
  next: string;
  counterJoin: string;
  developing: string;
  play: string;
  previousScene?: string;
  nextScene?: string;
}

export type KkViewerKeys = Readonly<Record<string, () => void>>;

export type KkViewerStepDelta = -1 | 1;

export type KkViewerEntrance = 'fade' | 'iris';
