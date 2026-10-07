import type { FC } from 'react';
import { KkWriteScreenLine } from './KkWriteScreenLine';

interface KkWriteScreenQuietProps {
  label: string;
  onSelect: () => void;
}

export const KkWriteScreenQuiet: FC<KkWriteScreenQuietProps> = ({ label, onSelect }) => (
  <KkWriteScreenLine label={label} tone="default" onSelect={onSelect} />
);
