import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkNote } from '@furria/ui/KkNote';
import type { FC } from 'react';
import { MANY_SELECTED_TITLE, toManySelectedLine } from '../hall-builder-copy';

interface HallManySectionProps {
  count: number;
}

export const HallManySection: FC<HallManySectionProps> = ({ count }) => {
  const line = toManySelectedLine(count);

  return (
    <KkFormSection title={MANY_SELECTED_TITLE}>
      <KkNote tone="muted">{line}</KkNote>
    </KkFormSection>
  );
};
