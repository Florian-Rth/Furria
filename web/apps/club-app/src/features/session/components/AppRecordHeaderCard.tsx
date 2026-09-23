import { KkEyebrow, KkHeading, KkPanel } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';

interface AppRecordHeaderCardProps {
  eyebrow: string;
  title: string;
  chips?: ReactNode;
  description: ReactNode;
  note?: ReactNode;
  actions: ReactNode;
  dimmed?: boolean;
}

export const AppRecordHeaderCard: FC<AppRecordHeaderCardProps> = ({
  eyebrow,
  title,
  chips,
  description,
  note,
  actions,
  dimmed = false,
}) => {
  const chipRow =
    chips === undefined ? null : (
      <Stack
        direction="row"
        sx={{ gap: 0.75, alignItems: 'center', flexWrap: 'wrap', minWidth: 0 }}
      >
        {chips}
      </Stack>
    );

  return (
    <KkPanel variant="block" dimmed={dimmed}>
      <Stack sx={{ gap: 1.75, minWidth: 0 }}>
        <Stack sx={{ gap: 1, minWidth: 0 }}>
          <KkEyebrow tone="accent">{eyebrow}</KkEyebrow>
          <KkHeading level={2}>{title}</KkHeading>
          {chipRow}
        </Stack>
        {description}
        {note}
        <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', minWidth: 0 }}>
          {actions}
        </Stack>
      </Stack>
    </KkPanel>
  );
};
