import { KkRetryAlert, KkSkeletonToolbar } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { CALENDAR_RETRY_LABEL, SCOPES_ERROR_MESSAGE } from '../calendar-labels';
import type { CalendarScopeTools } from '../hooks/use-calendar-scope-tools';
import { CalendarToolbar } from './CalendarToolbar';

const TOOLBAR_CHIPS = 3;

interface CalendarScopeBarProps {
  tools: CalendarScopeTools;
  scopeId: string;
  onScopeChange: (scopeId: string) => void;
}

export const CalendarScopeBar: FC<CalendarScopeBarProps> = ({ tools, scopeId, onScopeChange }) => {
  if (tools.phase === 'loading') {
    return <KkSkeletonToolbar chips={TOOLBAR_CHIPS} />;
  }

  const toolbar = (
    <CalendarToolbar scopeId={scopeId} options={tools.options} onScopeChange={onScopeChange} />
  );

  if (!tools.showsError) {
    return toolbar;
  }

  return (
    <Stack sx={{ gap: 1 }}>
      {toolbar}
      <KkRetryAlert
        message={SCOPES_ERROR_MESSAGE}
        retrying={tools.isRetrying}
        onRetry={tools.retry}
        retryLabel={CALENDAR_RETRY_LABEL}
      />
    </Stack>
  );
};
