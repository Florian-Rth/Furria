import type { FC } from 'react';
import { KkButton } from '../../../KkButton';

interface KkTeleprinterMoreProps {
  label: string;
  loading: boolean;
  onLoad: () => void;
}

export const KkTeleprinterMore: FC<KkTeleprinterMoreProps> = ({ label, loading, onLoad }) => (
  <KkButton variant="text" size="small" loading={loading} onClick={onLoad}>
    {label}
  </KkButton>
);
