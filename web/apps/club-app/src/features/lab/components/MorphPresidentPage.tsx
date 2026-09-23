import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import type { LabMorph } from '../lab-morphs';
import { COUNCIL_TITLE, councilPathOf, PRESIDENT_TITLE } from '../lab-morphs';
import { LabPeople } from './LabPeople';

interface MorphPresidentPageProps {
  morph: LabMorph;
}

export const MorphPresidentPage: FC<MorphPresidentPageProps> = ({ morph }) => {
  const origin = { label: COUNCIL_TITLE, to: councilPathOf(morph) };

  return (
    <KkScreen kind="detail" title={PRESIDENT_TITLE} origin={origin} barMorph={morph.name}>
      <LabPeople />
    </KkScreen>
  );
};
