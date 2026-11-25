import { KkFacetTile } from '@furria/ui/KkFacetTile';
import type { FC } from 'react';
import { PRACTICE_READY, toDoorLabel } from '@/features/act-card/act-card-copy';

const SAMPLE_NAME = 'Gardetanz';
const SAMPLE_META = 'Tanz · 12 Personen';
const SAMPLE_EVENING = 'Nr. 4';
const SAMPLE_EVENING_DAY = 'Sa 7.2.';
const SAMPLE_TRAINING_DAY = 'Di 14.1.';
const SAMPLE_TRAINING_CLOCK = '19:00 Uhr';
const FIRST_TILE = 0;

const EVENING_LABEL = toDoorLabel('evening', 'studio', null);
const TRAINING_LABEL = toDoorLabel('training', 'studio', null);
const PRACTICE_LABEL = toDoorLabel('practice', 'studio', null);

export const HubHelpActPreview: FC = () => (
  <KkFacetTile label={SAMPLE_NAME} order={FIRST_TILE}>
    <KkFacetTile.Door icon="stage" label={SAMPLE_META} />
    <KkFacetTile.Figure value={SAMPLE_NAME} size="medium" />
    <KkFacetTile.Band>
      <KkFacetTile.Stack>
        <KkFacetTile.Line>{EVENING_LABEL}</KkFacetTile.Line>
        <KkFacetTile.Line tone="strong">{SAMPLE_EVENING}</KkFacetTile.Line>
        <KkFacetTile.Line tone="secondary">{SAMPLE_EVENING_DAY}</KkFacetTile.Line>
      </KkFacetTile.Stack>
      <KkFacetTile.Stack>
        <KkFacetTile.Line>{TRAINING_LABEL}</KkFacetTile.Line>
        <KkFacetTile.Line tone="strong">{SAMPLE_TRAINING_DAY}</KkFacetTile.Line>
        <KkFacetTile.Line tone="secondary">{SAMPLE_TRAINING_CLOCK}</KkFacetTile.Line>
      </KkFacetTile.Stack>
      <KkFacetTile.Stack>
        <KkFacetTile.Line>{PRACTICE_LABEL}</KkFacetTile.Line>
        <KkFacetTile.Line tone="positive">{PRACTICE_READY}</KkFacetTile.Line>
      </KkFacetTile.Stack>
    </KkFacetTile.Band>
  </KkFacetTile>
);
