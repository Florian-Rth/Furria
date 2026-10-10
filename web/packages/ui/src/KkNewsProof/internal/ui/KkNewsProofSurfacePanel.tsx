import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { NewsCutReportContext } from '../../../internal/news-surface/news-proofing';
import type { KkNewsProofFacts, KkNewsProofKind, KkNewsProofLabels } from '../../news-proof-types';
import { KkNewsProofOpener } from '../layout/KkNewsProofOpener';
import { KkNewsProofPanel } from '../layout/KkNewsProofPanel';
import { KkNewsProofPanelHead } from '../layout/KkNewsProofPanelHead';
import { KkNewsProofScale } from '../layout/KkNewsProofScale';
import { usePanelCuts } from '../logic/use-panel-cuts';
import { KkNewsCardProof } from './KkNewsCardProof';
import { KkNewsLeadProof } from './KkNewsLeadProof';
import { KkNewsProofChangedMark } from './KkNewsProofChangedMark';
import { KkNewsProofCutNote } from './KkNewsProofCutNote';
import { KkNewsProofLiveTick } from './KkNewsProofLiveTick';
import { KkNewsProofPanelLabel } from './KkNewsProofPanelLabel';
import { KkNewsRowProof } from './KkNewsRowProof';
import { KkNewsWhatsAppProof } from './KkNewsWhatsAppProof';

interface KkNewsProofSurfaceProps {
  facts: KkNewsProofFacts;
  labels: KkNewsProofLabels;
}

const SURFACE_TOP = 3.25;

const SURFACES: Record<KkNewsProofKind, FC<KkNewsProofSurfaceProps>> = {
  lead: KkNewsLeadProof,
  row: KkNewsRowProof,
  card: KkNewsCardProof,
  whatsapp: KkNewsWhatsAppProof,
};

interface KkNewsProofSurfacePanelProps {
  kind: KkNewsProofKind;
  facts: KkNewsProofFacts;
  labels: KkNewsProofLabels;
  liveKey: number;
  order: number;
  isScaled: boolean;
  onOpen?: () => void;
}

export const KkNewsProofSurfacePanel: FC<KkNewsProofSurfacePanelProps> = ({
  kind,
  facts,
  labels,
  liveKey,
  order,
  isScaled,
  onOpen,
}) => {
  const cuts = usePanelCuts();
  const Surface = SURFACES[kind];
  const label = isScaled ? labels.tiles[kind] : labels.panels[kind];
  const surface = <Surface facts={facts} labels={labels} />;
  const scaled = <KkNewsProofScale>{surface}</KkNewsProofScale>;
  const openerLabel = `${label} · ${labels.enlarge}`;
  const opened =
    onOpen === undefined ? (
      scaled
    ) : (
      <KkNewsProofOpener label={openerLabel} onOpen={onOpen}>
        {scaled}
      </KkNewsProofOpener>
    );
  const body = isScaled ? opened : surface;
  const cutNote = cuts.isCut ? <KkNewsProofCutNote label={labels.cut} /> : null;
  const changedMark =
    facts.changed && !isScaled ? <KkNewsProofChangedMark label={labels.changed} /> : null;

  return (
    <NewsCutReportContext.Provider value={cuts.report}>
      <KkNewsProofPanel label={label}>
        <KkNewsProofPanelHead>
          <KkNewsProofPanelLabel label={label} />
          <Stack direction="row" sx={{ gap: 0.75, alignItems: 'center' }}>
            {cutNote}
            {changedMark}
          </Stack>
        </KkNewsProofPanelHead>
        {body}
        <KkNewsProofLiveTick
          label={labels.live}
          liveKey={liveKey}
          order={order}
          top={SURFACE_TOP}
        />
      </KkNewsProofPanel>
    </NewsCutReportContext.Provider>
  );
};
