import type { ClearanceFinding } from '@/features/hall-plan/plan-clearance';
import type { RectSide } from '@/features/hall-plan/schemas';
import { findRow } from '@/features/hall-plan/table-plan-ops';
import type { PlannerAction } from '../planner-actions';
import { useTablePlannerContext } from '../table-planner-context';
import {
  SHOW_FINDING_LABEL,
  toClearSideLabel,
  toFindingDistance,
  toFindingTitle,
  toRowLabel,
} from '../table-planner-copy';

export interface FindingItem {
  key: string;
  severity: ClearanceFinding['severity'];
  title: string;
  value: string;
  actions: PlannerAction[];
}

export interface FindingsList {
  open: boolean;
  close: () => void;
  items: FindingItem[];
}

const isRectSide = (side: string): side is RectSide => side !== 'around';

export const useFindingsList = (): FindingsList => {
  const planner = useTablePlannerContext();
  const document = planner.editor.document;

  const itemOf = (finding: ClearanceFinding): FindingItem => {
    const clears = finding.severity === 'conflict' ? finding.sides : [];
    const sideActions = clears.flatMap((ref): PlannerAction[] => {
      const row = findRow(document, ref.rowId);
      const side = ref.side;
      if (row === null || !isRectSide(side)) {
        return [];
      }

      return [
        {
          id: `${ref.rowId}:${side}`,
          label: toClearSideLabel(side, toRowLabel(row.number, row.count)),
          icon: 'chair',
          onClick: () => {
            planner.commands.clearSides([ref]);
          },
        },
      ];
    });

    return {
      key: finding.key,
      severity: finding.severity,
      title: toFindingTitle(finding.kind),
      value: toFindingDistance(finding.kind, finding.distanceCm),
      actions: [
        {
          id: 'show',
          label: SHOW_FINDING_LABEL,
          icon: 'zoom',
          onClick: () => {
            planner.focusFinding(finding);
          },
        },
        ...sideActions,
      ],
    };
  };

  return {
    open: planner.drawer === 'findings',
    close: () => {
      planner.openDrawer(null);
    },
    items: planner.findings.map(itemOf),
  };
};
