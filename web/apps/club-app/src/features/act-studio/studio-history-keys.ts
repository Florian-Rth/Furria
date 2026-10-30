export type HistoryKey = 'undo' | 'redo';

export interface HistoryKeyPress {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  typing: boolean;
}

export const historyKeyOf = (press: HistoryKeyPress): HistoryKey | null => {
  if (press.typing || press.altKey || !(press.ctrlKey || press.metaKey)) {
    return null;
  }

  const key = press.key.toLowerCase();
  if (key === 'z') {
    return press.shiftKey ? 'redo' : 'undo';
  }

  return key === 'y' && !press.shiftKey ? 'redo' : null;
};
