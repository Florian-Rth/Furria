import { reasonsOf } from '@furria/studio/edit-jobs';
import { EJ_BAR_LABEL, EJ_JOB_GLYPH, reasonLineOf } from '@furria/studio/edit-jobs-copy';
import type { JobPhone } from '@furria/studio/use-job-phone';
import { KkEjStageHint } from '@furria/ui/KkEjStageHint';
import { KkEjToolBar } from '@furria/ui/KkEjToolBar';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

interface JobPhoneToolsProps {
  ej: JobPhone;
}

export const JobPhoneTools: FC<JobPhoneToolsProps> = ({ ej }) => {
  const tools = ej.bar.map((action) => (
    <KkEjToolBar.Tool
      key={action.key}
      text={action.text}
      glyph={action.glyph}
      tone={action.tone}
      label={action.label}
      pressed={action.pressed}
      disabled={action.disabled}
      onPress={action.press}
    />
  ));

  const line = reasonLineOf(reasonsOf(ej.bar)) ?? ej.view.context;

  return (
    <Stack sx={{ gap: 0.5, minWidth: 0 }}>
      <KkEjStageHint glyph={EJ_JOB_GLYPH[ej.jobs.job]} text={line} wraps />
      <KkEjToolBar label={EJ_BAR_LABEL}>{tools}</KkEjToolBar>
    </Stack>
  );
};
