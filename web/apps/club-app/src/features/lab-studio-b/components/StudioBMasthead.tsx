import { KkStudioBManual } from '@furria/ui/KkStudioBManual';
import type { FC } from 'react';

interface StudioBMastheadProps {
  facts: readonly string[];
  own: string | null;
}

export const StudioBMasthead: FC<StudioBMastheadProps> = ({ facts, own }) => (
  <KkStudioBManual.Masthead facts={facts} own={own} />
);
