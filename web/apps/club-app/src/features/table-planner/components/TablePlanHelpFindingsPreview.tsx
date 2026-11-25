import { KkPlanStatusStrip } from '@furria/ui/KkPlanStatusStrip';
import type { FC } from 'react';
import {
  CHAIRS_COUNT_LABEL,
  STATUS_LABEL,
  TABLES_COUNT_LABEL,
  toFindingsChipLabel,
} from '../table-planner-copy';

const SAMPLE_TABLES = '24';
const SAMPLE_CHAIRS = '192';
const SAMPLE_CONFLICTS = 0;
const SAMPLE_NARROW = 2;
const FINDINGS_LABEL = toFindingsChipLabel(SAMPLE_CONFLICTS, SAMPLE_NARROW);

const keep = (): void => {};

export const TablePlanHelpFindingsPreview: FC = () => (
  <KkPlanStatusStrip label={STATUS_LABEL}>
    <KkPlanStatusStrip.Count value={SAMPLE_TABLES} label={TABLES_COUNT_LABEL} />
    <KkPlanStatusStrip.Count value={SAMPLE_CHAIRS} label={CHAIRS_COUNT_LABEL} />
    <KkPlanStatusStrip.Chip label={FINDINGS_LABEL} tone="hint" icon="alert" onClick={keep} />
  </KkPlanStatusStrip>
);
