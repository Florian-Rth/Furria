import type { KkIconName } from '@furria/ui/KkIcon';
import { useTablePlannerContext } from '../table-planner-context';
import {
  DELETE_LABEL,
  DUPLICATE_LABEL,
  GROUP_LABEL,
  LESS_TABLE_LABEL,
  MORE_LABEL,
  MORE_TABLE_LABEL,
  ROTATE_LEFT_LABEL,
  ROTATE_RIGHT_LABEL,
  TABLE_COUNT_READOUT_LABEL,
  UNGROUP_LABEL,
} from '../table-planner-copy';

const ROTATE_STEP_DEGREES = 15;

export type TouchActionItem =
  | {
      kind: 'button';
      id: string;
      label: string;
      icon: KkIconName;
      danger: boolean;
      narrowHidden: boolean;
      onClick: () => void;
    }
  | { kind: 'readout'; id: string; label: string; value: string }
  | { kind: 'divider'; id: string };

const NARROW_HIDDEN_ACTIONS: readonly string[] = ['rotateLeft', 'rotateRight'];

const button = (
  id: string,
  label: string,
  icon: KkIconName,
  onClick: () => void,
  danger = false,
): TouchActionItem => ({
  kind: 'button',
  id,
  label,
  icon,
  danger,
  narrowHidden: NARROW_HIDDEN_ACTIONS.includes(id),
  onClick,
});

export const useTouchActions = (): readonly TouchActionItem[] => {
  const planner = useTablePlannerContext();
  const { commands, target } = planner;
  const rotateLeft = (): void => {
    commands.rotate(-ROTATE_STEP_DEGREES);
  };
  const rotateRight = (): void => {
    commands.rotate(ROTATE_STEP_DEGREES);
  };
  const removeTable = (): void => {
    commands.changeCount(-1);
  };
  const addTable = (): void => {
    commands.changeCount(1);
  };
  const shared: readonly TouchActionItem[] = [
    button('rotateLeft', ROTATE_LEFT_LABEL, 'rotateLeft', rotateLeft),
    button('rotateRight', ROTATE_RIGHT_LABEL, 'rotate', rotateRight),
    button('duplicate', DUPLICATE_LABEL, 'copy', commands.duplicate),
    button('delete', DELETE_LABEL, 'delete', commands.remove, true),
    { kind: 'divider', id: 'divider' },
    button('more', MORE_LABEL, 'menuVertical', planner.inspectSelection),
  ];

  switch (target.kind) {
    case 'row':
      return [
        button('removeTable', LESS_TABLE_LABEL, 'subtract', removeTable),
        {
          kind: 'readout',
          id: 'count',
          label: TABLE_COUNT_READOUT_LABEL,
          value: String(target.row.count),
        },
        button('addTable', MORE_TABLE_LABEL, 'add', addTable),
        ...shared,
      ];
    case 'group':
      return [button('ungroup', UNGROUP_LABEL, 'ungroup', commands.ungroup), ...shared];
    case 'rows':
      return [button('group', GROUP_LABEL, 'groupTables', commands.group), ...shared];
    case 'plan':
    case 'chair':
      return [];
  }
};
