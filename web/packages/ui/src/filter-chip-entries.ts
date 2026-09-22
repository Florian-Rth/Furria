import type { KkTone } from './internal/tone';

export interface KkFilterOption {
  id: string;
  label: string;
  count: number;
  tone?: KkTone;
  countFirst?: boolean;
}

export interface KkFilterChipEntry {
  id: string;
  text: string;
  selected: boolean;
  tone: KkTone | undefined;
}

const toChipText = (option: KkFilterOption): string =>
  option.countFirst === true
    ? `${option.count} ${option.label}`
    : `${option.label} ${option.count}`;

export const toFilterChipEntries = (
  options: readonly KkFilterOption[],
  value: string,
): KkFilterChipEntry[] =>
  options.map((option) => ({
    id: option.id,
    text: toChipText(option),
    selected: option.id === value,
    tone: option.tone,
  }));
