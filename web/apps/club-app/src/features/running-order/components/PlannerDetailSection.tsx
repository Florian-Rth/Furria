import { KkEyebrow } from '@furria/ui/KkEyebrow';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren, ReactNode } from 'react';

interface PlannerDetailSectionProps extends PropsWithChildren {
  title: string;
  action?: ReactNode;
}

export const PlannerDetailSection: FC<PlannerDetailSectionProps> = ({
  title,
  action,
  children,
}) => {
  const head =
    action === undefined ? (
      <KkEyebrow tone="muted">{title}</KkEyebrow>
    ) : (
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, minWidth: 0 }}
      >
        <KkEyebrow tone="muted" sx={{ minWidth: 0, whiteSpace: 'nowrap' }}>
          {title}
        </KkEyebrow>
        {action}
      </Stack>
    );

  return (
    <Stack component="section" sx={{ gap: 1, minWidth: 0 }}>
      {head}
      {children}
    </Stack>
  );
};
