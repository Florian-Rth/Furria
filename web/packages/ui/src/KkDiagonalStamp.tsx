import type { FC } from 'react';
import { KkDiagonalStampImprint } from './internal/KkDiagonalStampImprint';

interface KkDiagonalStampProps {
  label: string;
  fireKey: number;
}

export const KkDiagonalStamp: FC<KkDiagonalStampProps> = ({ label, fireKey }) =>
  fireKey === 0 ? null : <KkDiagonalStampImprint key={fireKey} label={label} />;
