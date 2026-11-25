import type { KkSeverity } from '@furria/ui/KkSeverityGlyph';
import { KkSeverityGlyph } from '@furria/ui/KkSeverityGlyph';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toFindingTitle } from '../running-order-copy';
import type { FindingKind } from '../schemas';

interface SampleMark {
  severity: KkSeverity;
  kind: FindingKind;
}

const SAMPLE_MARKS: readonly SampleMark[] = [
  { severity: 'conflict', kind: 'noChangeover' },
  { severity: 'hint', kind: 'tightChangeover' },
];

export const RunningOrderHelpMarksPreview: FC = () => {
  const marks = SAMPLE_MARKS.map((mark) => (
    <Stack key={mark.kind} direction="row" sx={{ alignItems: 'center', gap: 1 }}>
      <KkSeverityGlyph state={mark.severity} size="medium" />
      <KkText>{toFindingTitle(mark.kind)}</KkText>
    </Stack>
  ));

  return <Stack sx={{ gap: 1, minWidth: 0 }}>{marks}</Stack>;
};
