export type DeskKey =
  | 'toggle'
  | 'stepBack'
  | 'stepForward'
  | 'countBack'
  | 'countForward'
  | 'zoomIn'
  | 'zoomOut';

export interface DeskKeyPress {
  key: string;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  typing: boolean;
  onControl: boolean;
}

const ZOOM_KEYS: Readonly<Record<string, DeskKey>> = {
  '+': 'zoomIn',
  '=': 'zoomIn',
  '-': 'zoomOut',
  _: 'zoomOut',
};

export const deskKeyOf = (press: DeskKeyPress): DeskKey | null => {
  if (press.typing || press.ctrlKey || press.metaKey || press.altKey) {
    return null;
  }
  if (press.key === ' ') {
    return press.onControl ? null : 'toggle';
  }
  if (press.key === 'ArrowLeft') {
    return press.shiftKey ? 'countBack' : 'stepBack';
  }
  if (press.key === 'ArrowRight') {
    return press.shiftKey ? 'countForward' : 'stepForward';
  }

  return ZOOM_KEYS[press.key] ?? null;
};
