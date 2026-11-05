import { KkCheckboxRow } from '@furria/ui/KkCheckboxRow';
import { KkFieldRow } from '@furria/ui/KkFieldRow';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { RectSide } from '@/features/hall-plan/schemas';
import type { SideToggle } from '../planner-facts';
import { SIDE_LABELS, SIDES_FIELD_LABEL } from '../table-planner-copy';

interface TablePlannerSidesFieldProps {
  toggles: readonly SideToggle[];
  onChange: (side: RectSide, seated: boolean) => void;
}

export const TablePlannerSidesField: FC<TablePlannerSidesFieldProps> = ({ toggles, onChange }) => {
  const rows = toggles.map((toggle) => {
    const change = (checked: boolean): void => {
      onChange(toggle.side, checked);
    };

    return (
      <KkCheckboxRow
        key={toggle.side}
        label={SIDE_LABELS[toggle.side]}
        checked={toggle.seated}
        disabled={!toggle.available}
        onChange={change}
      />
    );
  });

  return <KkFieldRow label={SIDES_FIELD_LABEL} value={<Stack>{rows}</Stack>} />;
};
