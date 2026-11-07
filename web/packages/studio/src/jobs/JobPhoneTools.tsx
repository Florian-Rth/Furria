import { JOB_BAR_LABEL, JOB_GLYPH, reasonLineOf } from '@furria/studio/job-copy';
import { reasonsOf } from '@furria/studio/job-model';
import type { JobPhone } from '@furria/studio/use-job-phone';
import { KkEditorToolBar } from '@furria/ui/KkEditorToolBar';
import { KkStageHint } from '@furria/ui/KkStageHint';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

interface JobPhoneToolsProps {
  jobPhone: JobPhone;
}

export const JobPhoneTools: FC<JobPhoneToolsProps> = ({ jobPhone }) => {
  const tools = jobPhone.bar.map((action) => (
    <KkEditorToolBar.Tool
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

  const line = reasonLineOf(reasonsOf(jobPhone.bar)) ?? jobPhone.view.context;

  return (
    <Stack sx={{ gap: 0.5, minWidth: 0 }}>
      <KkStageHint glyph={JOB_GLYPH[jobPhone.jobs.job]} text={line} wraps />
      <KkEditorToolBar label={JOB_BAR_LABEL}>{tools}</KkEditorToolBar>
    </Stack>
  );
};
