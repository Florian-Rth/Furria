import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkSelectRow } from '@furria/ui/KkSelectRow';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { TablePlanSummary } from '@/features/hall-plan/schemas';
import { toLocalIsoDay } from '@/lib/calendar-days';
import { formatIsoDay } from '@/lib/membership-labels';
import { START_COPY_TITLE, toCopyMeta } from '../table-planner-copy';

interface TablePlannerCopySourcesProps {
  sources: readonly TablePlanSummary[];
  disabled: boolean;
  onChoose: (source: TablePlanSummary) => void;
}

export const TablePlannerCopySources: FC<TablePlannerCopySourcesProps> = ({
  sources,
  disabled,
  onChoose,
}) => {
  const rows = sources.map((source) => {
    const choose = (): void => {
      if (!disabled) {
        onChoose(source);
      }
    };
    const meta = toCopyMeta(
      formatIsoDay(toLocalIsoDay(source.startsAt)),
      source.hallName,
      source.tables,
    );

    return (
      <KkSelectRow
        key={source.eventId}
        title={source.title}
        meta={meta}
        dimmed={disabled}
        onClick={choose}
      />
    );
  });

  return (
    <KkPanelSection title={START_COPY_TITLE}>
      <Stack>{rows}</Stack>
    </KkPanelSection>
  );
};
