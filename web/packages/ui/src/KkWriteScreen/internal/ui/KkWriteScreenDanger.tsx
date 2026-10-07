import type { FC } from 'react';
import { KkWriteScreenLine } from './KkWriteScreenLine';

interface KkWriteScreenDangerProps {
  label: string;
  onSelect: () => void;
}

export const KkWriteScreenDanger: FC<KkWriteScreenDangerProps> = ({ label, onSelect }) => (
  <KkWriteScreenLine label={label} tone="danger" onSelect={onSelect} />
);
