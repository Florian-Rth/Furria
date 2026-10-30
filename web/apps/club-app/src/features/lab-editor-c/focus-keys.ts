export type FocusKey =
  | 'toggle'
  | 'previousStep'
  | 'nextStep'
  | 'previousCount'
  | 'nextCount'
  | 'zoomIn'
  | 'zoomOut';

export interface FocusKeyPress {
  key: string;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  typing: boolean;
  pressing: boolean;
}

export const focusKeyOf = (press: FocusKeyPress): FocusKey | null => {
  if (press.typing || press.ctrlKey || press.metaKey || press.altKey) {
    return null;
  }

  switch (press.key) {
    case ' ':
      return press.pressing ? null : 'toggle';
    case 'ArrowLeft':
      return press.shiftKey ? 'previousCount' : 'previousStep';
    case 'ArrowRight':
      return press.shiftKey ? 'nextCount' : 'nextStep';
    case '+':
    case '=':
      return 'zoomIn';
    case '-':
      return 'zoomOut';
    default:
      return null;
  }
};
