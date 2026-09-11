export interface KkFilterOption {
  id: string;
  label: string;
  count: number;
}

export interface KkFilterChipEntry {
  id: string;
  text: string;
  selected: boolean;
}

export const toFilterChipEntries = (
  options: readonly KkFilterOption[],
  value: string,
): KkFilterChipEntry[] =>
  options.map((option) => ({
    id: option.id,
    text: `${option.label} ${option.count}`,
    selected: option.id === value,
  }));
