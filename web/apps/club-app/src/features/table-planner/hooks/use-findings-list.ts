import type { ClearanceFinding } from '@/features/hall-plan/plan-clearance';
import { findChair } from '@/features/hall-plan/table-layout';
import type { PlannerAction } from '../planner-actions';
import { useTablePlannerContext } from '../table-planner-context';
import {
  RELEASE_CHAIRS_LABEL,
  SHOW_FINDING_LABEL,
  toFindingDistance,
  toFindingTitle,
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

export const useFindingsList = (): FindingsList => {
  const planner = useTablePlannerContext();

  const itemOf = (finding: ClearanceFinding): FindingItem => {
    const keptChairs =
      finding.severity === 'conflict'
        ? finding.chairs.filter((chair) => findChair(planner.layouts, chair)?.kept === true)
        : [];
    const release: PlannerAction[] =
      keptChairs.length === 0
        ? []
        : [
            {
              id: 'release',
              label: RELEASE_CHAIRS_LABEL,
              icon: 'chair',
              onClick: () => {
                planner.commands.releaseChairs(keptChairs);
              },
            },
          ];

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
        ...release,
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
